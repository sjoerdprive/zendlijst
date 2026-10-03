import "server-only";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { decryptEmail } from "@/shared/crypto";
import { delivery, getDb, newsletter } from "@/shared/db";
import type { DeliveryStats, FailedDelivery } from "./types";

// Failed deliveries nobody has handled yet, newest first.
export const listUnresolvedFailures = async (
  organisationId: string,
  newsletterId?: string,
): Promise<FailedDelivery[]> => {
  const rows = await getDb()
    .select({
      id: delivery.id,
      newsletterId: delivery.newsletterId,
      newsletterTitle: newsletter.title,
      emailEncrypted: delivery.recipientEmailEncrypted,
      attempts: delivery.attempts,
      lastError: delivery.lastError,
      failedAt: delivery.failedAt,
    })
    .from(delivery)
    .innerJoin(newsletter, eq(newsletter.id, delivery.newsletterId))
    .where(
      and(
        eq(newsletter.organisationId, organisationId),
        eq(delivery.status, "failed"),
        isNull(delivery.resolvedAt),
        newsletterId ? eq(delivery.newsletterId, newsletterId) : undefined,
      ),
    )
    .orderBy(desc(delivery.failedAt));
  return rows.map(({ emailEncrypted, failedAt, ...row }) => ({
    ...row,
    failedAt: failedAt ?? new Date(0),
    email: decryptEmail(emailEncrypted),
  }));
};

// Marks a failure as handled manually (e.g. the newsletter was forwarded by hand).
export const resolveFailure = async (
  organisationId: string,
  deliveryId: string,
  userId: string,
): Promise<boolean> => {
  const updated = await getDb()
    .update(delivery)
    .set({ resolvedAt: new Date(), resolvedById: userId })
    .where(
      and(
        eq(delivery.id, deliveryId),
        eq(delivery.status, "failed"),
        isNull(delivery.resolvedAt),
        sql`${delivery.newsletterId} in (select ${newsletter.id} from ${newsletter} where ${newsletter.organisationId} = ${organisationId})`,
      ),
    )
    .returning({ id: delivery.id });
  return updated.length > 0;
};

export const getDeliveryStats = async (
  organisationId: string,
): Promise<Record<string, DeliveryStats>> => {
  const rows = await getDb()
    .select({
      newsletterId: delivery.newsletterId,
      pending: sql<number>`count(*) filter (where ${delivery.status} = 'pending')::int`,
      sent: sql<number>`count(*) filter (where ${delivery.status} = 'sent')::int`,
      failed: sql<number>`count(*) filter (where ${delivery.status} = 'failed')::int`,
      resolved: sql<number>`count(*) filter (where ${delivery.resolvedAt} is not null)::int`,
    })
    .from(delivery)
    .innerJoin(newsletter, eq(newsletter.id, delivery.newsletterId))
    .where(eq(newsletter.organisationId, organisationId))
    .groupBy(delivery.newsletterId);
  return Object.fromEntries(rows.map(({ newsletterId, ...stats }) => [newsletterId, stats]));
};
