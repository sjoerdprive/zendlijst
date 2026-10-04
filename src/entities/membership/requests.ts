import "server-only";
import { and, asc, count, eq } from "drizzle-orm";
import { decryptEmail } from "@/shared/crypto";
import { getDb, membership, subscriptionRequest, user } from "@/shared/db";
import type { ApprovedRequest, SubscriptionRequest } from "./types";

// Idempotent: asking twice keeps the first request.
export const createSubscriptionRequest = async (
  organisationId: string,
  userId: string,
  emailNotifications: boolean,
): Promise<void> => {
  await getDb()
    .insert(subscriptionRequest)
    .values({ organisationId, userId, emailNotifications })
    .onConflictDoNothing();
};

export const hasSubscriptionRequest = async (organisationId: string, userId: string): Promise<boolean> => {
  const [row] = await getDb()
    .select({ id: subscriptionRequest.id })
    .from(subscriptionRequest)
    .where(and(eq(subscriptionRequest.organisationId, organisationId), eq(subscriptionRequest.userId, userId)))
    .limit(1);
  return Boolean(row);
};

export const listSubscriptionRequests = async (organisationId: string): Promise<SubscriptionRequest[]> => {
  const rows = await getDb()
    .select({
      id: subscriptionRequest.id,
      createdAt: subscriptionRequest.createdAt,
      emailNotifications: subscriptionRequest.emailNotifications,
      emailEncrypted: user.emailEncrypted,
    })
    .from(subscriptionRequest)
    .innerJoin(user, eq(user.id, subscriptionRequest.userId))
    .where(eq(subscriptionRequest.organisationId, organisationId))
    .orderBy(asc(subscriptionRequest.createdAt));
  return rows.flatMap(({ emailEncrypted, ...row }) =>
    emailEncrypted ? [{ ...row, email: decryptEmail(emailEncrypted) }] : [],
  );
};

export const countSubscriptionRequests = async (organisationId: string): Promise<number> => {
  const [row] = await getDb()
    .select({ value: count() })
    .from(subscriptionRequest)
    .where(eq(subscriptionRequest.organisationId, organisationId));
  return row?.value ?? 0;
};

// Turns the request into a subscriber membership in one transaction. Returns
// null if the request no longer exists (handled by another admin).
export const approveSubscriptionRequest = async (
  organisationId: string,
  requestId: string,
): Promise<ApprovedRequest | null> =>
  getDb().transaction(async (tx) => {
    const [request] = await tx
      .delete(subscriptionRequest)
      .where(and(eq(subscriptionRequest.id, requestId), eq(subscriptionRequest.organisationId, organisationId)))
      .returning();
    if (!request) return null;
    await tx
      .insert(membership)
      .values({
        organisationId,
        userId: request.userId,
        role: "subscriber",
        emailNotifications: request.emailNotifications,
      })
      .onConflictDoNothing();
    const [member] = await tx
      .select({ emailEncrypted: user.emailEncrypted })
      .from(user)
      .where(eq(user.id, request.userId))
      .limit(1);
    return { email: member?.emailEncrypted ? decryptEmail(member.emailEncrypted) : null };
  });

// Returns the rejected person's email, or null if the request was already handled.
export const rejectSubscriptionRequest = async (
  organisationId: string,
  requestId: string,
): Promise<string | null> => {
  const [request] = await getDb()
    .delete(subscriptionRequest)
    .where(and(eq(subscriptionRequest.id, requestId), eq(subscriptionRequest.organisationId, organisationId)))
    .returning({ userId: subscriptionRequest.userId });
  if (!request) return null;
  const [member] = await getDb()
    .select({ emailEncrypted: user.emailEncrypted })
    .from(user)
    .where(eq(user.id, request.userId))
    .limit(1);
  return member?.emailEncrypted ? decryptEmail(member.emailEncrypted) : "";
};
