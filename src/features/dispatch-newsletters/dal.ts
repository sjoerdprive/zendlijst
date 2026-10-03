import "server-only";
import { and, eq, exists, inArray, isNull, lt, lte, or, sql } from "drizzle-orm";
import { delivery, getDb, membership, newsletter, user } from "@/shared/db";
import type { ClaimedDelivery, FailureAlertCandidate } from "./types";

export const MAX_ATTEMPTS = 3;
// Minutes to wait before attempt 2 and attempt 3.
const RETRY_DELAYS_MINUTES = [1, 5];
const LEASE_MINUTES = 5;

/*
 * Moves due newsletters from "scheduled" to "sending" and snapshots one
 * delivery row per opted-in member. Row locks with SKIP LOCKED make
 * concurrent scheduler runs safe; the unique (newsletter, membership) index
 * makes the snapshot idempotent.
 */
export const startDueNewsletters = async (): Promise<number> =>
  getDb().transaction(async (tx) => {
    const due = await tx
      .select({ id: newsletter.id, organisationId: newsletter.organisationId })
      .from(newsletter)
      .where(and(eq(newsletter.status, "scheduled"), lte(newsletter.scheduledAt, new Date())))
      .limit(10)
      .for("update", { skipLocked: true });

    for (const item of due) {
      // Copies the already-encrypted address; nothing is decrypted here.
      await tx.execute(sql`
        insert into ${delivery} (id, newsletter_id, membership_id, recipient_email_encrypted)
        select gen_random_uuid()::text, ${item.id}, ${membership.id}, ${user.emailEncrypted}
        from ${membership}
        inner join ${user} on ${user.id} = ${membership.userId}
        where ${membership.organisationId} = ${item.organisationId}
          and ${membership.emailNotifications} = true
          and ${user.emailEncrypted} is not null
        on conflict do nothing
      `);
      await tx.update(newsletter).set({ status: "sending" }).where(eq(newsletter.id, item.id));
    }
    return due.length;
  });

// Leases a batch of pending deliveries to this run.
export const claimDeliveries = async (limit: number): Promise<ClaimedDelivery[]> => {
  const db = getDb();
  const now = new Date();
  const candidates = db
    .select({ id: delivery.id })
    .from(delivery)
    .where(
      and(
        eq(delivery.status, "pending"),
        lte(delivery.nextAttemptAt, now),
        or(isNull(delivery.lockedUntil), lt(delivery.lockedUntil, now)),
      ),
    )
    .orderBy(delivery.nextAttemptAt)
    .limit(limit)
    .for("update", { skipLocked: true });

  return db
    .update(delivery)
    .set({
      lockedUntil: sql`now() + make_interval(mins => ${LEASE_MINUTES})`,
      attempts: sql`${delivery.attempts} + 1`,
    })
    .where(inArray(delivery.id, candidates))
    .returning({
      id: delivery.id,
      newsletterId: delivery.newsletterId,
      membershipId: delivery.membershipId,
      recipientEmailEncrypted: delivery.recipientEmailEncrypted,
      attempts: delivery.attempts,
    });
};

export const markDeliverySent = async (deliveryId: string): Promise<void> => {
  await getDb()
    .update(delivery)
    .set({ status: "sent", sentAt: new Date(), lockedUntil: null, lastError: null })
    .where(eq(delivery.id, deliveryId));
};

// Returns true when the delivery has now failed permanently.
export const markDeliveryAttemptFailed = async (
  claimed: ClaimedDelivery,
  error: string,
): Promise<boolean> => {
  const isFinal = claimed.attempts >= MAX_ATTEMPTS;
  const delayMinutes = RETRY_DELAYS_MINUTES[claimed.attempts - 1] ?? 5;
  await getDb()
    .update(delivery)
    .set(
      isFinal
        ? { status: "failed", failedAt: new Date(), lockedUntil: null, lastError: error }
        : {
            nextAttemptAt: new Date(Date.now() + delayMinutes * 60_000),
            lockedUntil: null,
            lastError: error,
          },
    )
    .where(eq(delivery.id, claimed.id));
  return isFinal;
};

// The subscriber left between scheduling and sending: nothing to deliver.
export const dropDelivery = async (deliveryId: string): Promise<void> => {
  await getDb().delete(delivery).where(eq(delivery.id, deliveryId));
};

export const finishCompletedNewsletters = async (): Promise<number> => {
  const pendingForNewsletter = getDb()
    .select({ id: delivery.id })
    .from(delivery)
    .where(and(eq(delivery.newsletterId, newsletter.id), eq(delivery.status, "pending")));

  const finished = await getDb()
    .update(newsletter)
    .set({ status: "sent", sentAt: new Date() })
    .where(and(eq(newsletter.status, "sending"), sql`not ${exists(pendingForNewsletter)}`))
    .returning({ id: newsletter.id });
  return finished.length;
};

// Finished newsletters with unresolved failures whose team has not been alerted yet.
export const listFailureAlertCandidates = async (): Promise<FailureAlertCandidate[]> => {
  const failedForNewsletter = getDb()
    .select({ id: delivery.id })
    .from(delivery)
    .where(
      and(
        eq(delivery.newsletterId, newsletter.id),
        eq(delivery.status, "failed"),
        isNull(delivery.resolvedAt),
      ),
    );

  return getDb()
    .select({ newsletterId: newsletter.id, organisationId: newsletter.organisationId })
    .from(newsletter)
    .where(
      and(
        eq(newsletter.status, "sent"),
        isNull(newsletter.failureNotifiedAt),
        exists(failedForNewsletter),
      ),
    );
};

// Claims the alert so concurrent runs do not both send it.
export const claimFailureAlert = async (newsletterId: string): Promise<boolean> => {
  const claimed = await getDb()
    .update(newsletter)
    .set({ failureNotifiedAt: new Date() })
    .where(and(eq(newsletter.id, newsletterId), isNull(newsletter.failureNotifiedAt)))
    .returning({ id: newsletter.id });
  return claimed.length > 0;
};

// Lets the next run retry the alert when it could not be delivered to anyone.
export const releaseFailureAlert = async (newsletterId: string): Promise<void> => {
  await getDb()
    .update(newsletter)
    .set({ failureNotifiedAt: null })
    .where(eq(newsletter.id, newsletterId));
};
