import "server-only";
import { and, desc, eq, TransactionRollbackError } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getEnv } from "@/shared/config";
import { decryptEmail, encryptEmail } from "@/shared/crypto";
import { getDb, organisation, organisationRequest } from "@/shared/db";
import type {
  NewOrganisationRequest,
  Organisation,
  OrganisationRequest,
} from "./types";
import { slugFromHost } from "./utils";

const toOrganisation = (row: typeof organisation.$inferSelect): Organisation => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
});

export const getOrganisationBySlug = cache(
  async (slug: string): Promise<Organisation | null> => {
    const [row] = await getDb()
      .select()
      .from(organisation)
      .where(eq(organisation.slug, slug))
      .limit(1);
    return row ? toOrganisation(row) : null;
  },
);

export const getOrganisationById = async (id: string): Promise<Organisation | null> => {
  const [row] = await getDb()
    .select()
    .from(organisation)
    .where(eq(organisation.id, id))
    .limit(1);
  return row ? toOrganisation(row) : null;
};

// The tenant is always derived from the Host header on the server, never from
// client input, so a form cannot act on a different organisation.
export const getCurrentOrganisation = cache(async (): Promise<Organisation | null> => {
  const host = (await headers()).get("host");
  if (!host) return null;
  const slug = slugFromHost(host, getEnv().APP_ROOT_DOMAIN);
  return slug ? getOrganisationBySlug(slug) : null;
});

export const requireCurrentOrganisation = async (): Promise<Organisation> => {
  const current = await getCurrentOrganisation();
  if (!current) notFound();
  return current;
};

export const isSlugAvailable = async (slug: string): Promise<boolean> => {
  const db = getDb();
  const [existing] = await db
    .select({ id: organisation.id })
    .from(organisation)
    .where(eq(organisation.slug, slug))
    .limit(1);
  if (existing) return false;
  const [pending] = await db
    .select({ id: organisationRequest.id })
    .from(organisationRequest)
    .where(and(eq(organisationRequest.slug, slug), eq(organisationRequest.status, "pending")))
    .limit(1);
  return !pending;
};

export const createOrganisationRequest = async (
  input: NewOrganisationRequest,
): Promise<void> => {
  await getDb()
    .insert(organisationRequest)
    .values({
      organisationName: input.organisationName,
      slug: input.slug,
      adminEmailEncrypted: encryptEmail(input.adminEmail),
      message: input.message || null,
    });
};

const toRequest = (
  row: typeof organisationRequest.$inferSelect,
): OrganisationRequest => ({
  id: row.id,
  organisationName: row.organisationName,
  slug: row.slug,
  adminEmail: decryptEmail(row.adminEmailEncrypted),
  message: row.message,
  status: row.status,
  createdAt: row.createdAt,
});

export const listOrganisationRequests = async (): Promise<OrganisationRequest[]> => {
  const rows = await getDb()
    .select()
    .from(organisationRequest)
    .orderBy(desc(organisationRequest.createdAt))
    .limit(100);
  return rows.map(toRequest);
};

export const getPendingOrganisationRequest = async (
  id: string,
): Promise<OrganisationRequest | null> => {
  const [row] = await getDb()
    .select()
    .from(organisationRequest)
    .where(and(eq(organisationRequest.id, id), eq(organisationRequest.status, "pending")))
    .limit(1);
  return row ? toRequest(row) : null;
};

export const rejectOrganisationRequest = async (id: string): Promise<void> => {
  await getDb()
    .update(organisationRequest)
    .set({ status: "rejected", reviewedAt: new Date() })
    .where(and(eq(organisationRequest.id, id), eq(organisationRequest.status, "pending")));
};

// Creates the organisation and closes the request atomically. Returns null if
// the request was already handled or the slug got taken in the meantime.
export const approveOrganisationRequest = async (
  id: string,
): Promise<Organisation | null> => {
  try {
    return await getDb().transaction(async (tx) => {
      const [request] = await tx
        .update(organisationRequest)
        .set({ status: "approved", reviewedAt: new Date() })
        .where(and(eq(organisationRequest.id, id), eq(organisationRequest.status, "pending")))
        .returning();
      if (!request) return null;
      const [created] = await tx
        .insert(organisation)
        .values({ slug: request.slug, name: request.organisationName })
        .onConflictDoNothing({ target: organisation.slug })
        .returning();
      // Slug got taken in the meantime: undo the status change.
      if (!created) tx.rollback();
      return created ? toOrganisation(created) : null;
    });
  } catch (error) {
    if (error instanceof TransactionRollbackError) return null;
    throw error;
  }
};
