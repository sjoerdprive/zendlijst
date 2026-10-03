import "server-only";
import { and, asc, count, eq, inArray, sql } from "drizzle-orm";
import { cache } from "react";
import { getSessionUser } from "@/shared/auth";
import { decryptEmail } from "@/shared/crypto";
import { getDb, membership, organisation, user } from "@/shared/db";
import type {
  AddMemberResult,
  MemberRole,
  MemberWithEmail,
  Membership,
  Recipient,
  Viewer,
} from "./types";
import { MAX_WRITERS } from "./utils";

const toMembership = (row: typeof membership.$inferSelect): Membership => ({
  id: row.id,
  organisationId: row.organisationId,
  userId: row.userId,
  role: row.role,
  emailNotifications: row.emailNotifications,
});

export const getMembership = async (
  organisationId: string,
  userId: string,
): Promise<Membership | null> => {
  const [row] = await getDb()
    .select()
    .from(membership)
    .where(and(eq(membership.organisationId, organisationId), eq(membership.userId, userId)))
    .limit(1);
  return row ? toMembership(row) : null;
};

// The signed-in user and their membership of the given organisation.
export const getViewer = cache(async (organisationId: string): Promise<Viewer | null> => {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;
  return {
    userId: sessionUser.id,
    email: sessionUser.email,
    membership: await getMembership(organisationId, sessionUser.id),
  };
});

// Authorization check for server actions, route handlers and pages: returns the
// viewer's membership only when it has one of the allowed roles.
export const authorizeMember = async (
  organisationId: string,
  roles: MemberRole[] = ["admin", "writer", "subscriber"],
): Promise<Membership | null> => {
  const viewer = await getViewer(organisationId);
  const current = viewer?.membership;
  return current && roles.includes(current.role) ? current : null;
};

// Idempotent: creating a subscription for an existing member keeps their role.
export const ensureSubscription = async (
  organisationId: string,
  userId: string,
  emailNotifications: boolean,
): Promise<Membership> => {
  const db = getDb();
  const [created] = await db
    .insert(membership)
    .values({ organisationId, userId, role: "subscriber", emailNotifications })
    .onConflictDoNothing()
    .returning();
  if (created) return toMembership(created);
  const existing = await getMembership(organisationId, userId);
  if (!existing) throw new Error("Membership vanished during subscribe");
  return existing;
};

export const setEmailNotifications = async (
  membershipId: string,
  enabled: boolean,
): Promise<void> => {
  await getDb()
    .update(membership)
    .set({ emailNotifications: enabled })
    .where(eq(membership.id, membershipId));
};

export const getMembershipById = async (
  membershipId: string,
): Promise<Membership | null> => {
  const [row] = await getDb()
    .select()
    .from(membership)
    .where(eq(membership.id, membershipId))
    .limit(1);
  return row ? toMembership(row) : null;
};

// Admin memberships can never be deleted, whatever `roles` says.
export const deleteMembership = async (
  organisationId: string,
  membershipId: string,
  roles: Array<Exclude<MemberRole, "admin">> = ["subscriber"],
): Promise<boolean> => {
  const deleted = await getDb()
    .delete(membership)
    .where(
      and(
        eq(membership.id, membershipId),
        eq(membership.organisationId, organisationId),
        inArray(membership.role, roles),
      ),
    )
    .returning({ id: membership.id });
  return deleted.length > 0;
};

export const listMembers = async (
  organisationId: string,
  roles: MemberRole[],
): Promise<MemberWithEmail[]> => {
  const rows = await getDb()
    .select({
      id: membership.id,
      userId: membership.userId,
      role: membership.role,
      emailNotifications: membership.emailNotifications,
      createdAt: membership.createdAt,
      emailEncrypted: user.emailEncrypted,
    })
    .from(membership)
    .innerJoin(user, eq(user.id, membership.userId))
    .where(and(eq(membership.organisationId, organisationId), inArray(membership.role, roles)))
    .orderBy(asc(membership.createdAt));
  return rows.map(({ emailEncrypted, ...row }) => ({
    ...row,
    email: emailEncrypted ? decryptEmail(emailEncrypted) : "(unknown)",
  }));
};

export const listNewsletterRecipients = async (
  organisationId: string,
): Promise<Recipient[]> => {
  const rows = await getDb()
    .select({ membershipId: membership.id, emailEncrypted: user.emailEncrypted })
    .from(membership)
    .innerJoin(user, eq(user.id, membership.userId))
    .where(and(eq(membership.organisationId, organisationId), eq(membership.emailNotifications, true)));
  return rows.flatMap(({ membershipId, emailEncrypted }) =>
    emailEncrypted ? [{ membershipId, email: decryptEmail(emailEncrypted) }] : [],
  );
};

export const listTeamEmails = async (organisationId: string): Promise<string[]> => {
  const members = await listMembers(organisationId, ["admin", "writer"]);
  return members.map((member) => member.email);
};

export const countSubscribers = async (organisationId: string): Promise<number> => {
  const [row] = await getDb()
    .select({ value: count() })
    .from(membership)
    .where(eq(membership.organisationId, organisationId));
  return row?.value ?? 0;
};

/*
 * Adds a user with the given role. Promoting an existing subscriber to writer
 * keeps their notification preference. The writer limit is enforced inside a
 * transaction with a row lock on the organisation's memberships so two admins
 * clicking at once cannot exceed it.
 */
export const addMember = async (
  organisationId: string,
  userId: string,
  role: MemberRole,
): Promise<AddMemberResult> =>
  getDb().transaction(async (tx) => {
    if (role === "writer") {
      // Serialise writer changes per organisation (locks the organisation row).
      await tx.execute(
        sql`select ${organisation.id} from ${organisation} where ${organisation.id} = ${organisationId} for update`,
      );
      const [writers] = await tx
        .select({ value: count() })
        .from(membership)
        .where(and(eq(membership.organisationId, organisationId), eq(membership.role, "writer")));
      if ((writers?.value ?? 0) >= MAX_WRITERS) return { status: "writer-limit-reached" };
    }

    const [existing] = await tx
      .select()
      .from(membership)
      .where(and(eq(membership.organisationId, organisationId), eq(membership.userId, userId)))
      .limit(1);

    if (!existing) {
      const [created] = await tx
        .insert(membership)
        .values({ organisationId, userId, role, emailNotifications: role === "subscriber" })
        .returning({ id: membership.id });
      if (!created) throw new Error("Failed to create membership");
      return { status: "added", membershipId: created.id };
    }

    const isUpgrade = existing.role === "subscriber" && role !== "subscriber";
    if (!isUpgrade) return { status: "already-member" };

    await tx.update(membership).set({ role }).where(eq(membership.id, existing.id));
    return { status: "updated", membershipId: existing.id };
  });

export const demoteWriter = async (
  organisationId: string,
  membershipId: string,
): Promise<boolean> => {
  const updated = await getDb()
    .update(membership)
    .set({ role: "subscriber" })
    .where(
      and(
        eq(membership.id, membershipId),
        eq(membership.organisationId, organisationId),
        eq(membership.role, "writer"),
      ),
    )
    .returning({ id: membership.id });
  return updated.length > 0;
};
