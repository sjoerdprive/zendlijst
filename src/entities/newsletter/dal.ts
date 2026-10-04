import "server-only";
import { and, asc, desc, eq, gt, inArray, sql } from "drizzle-orm";
import { getDb, newsletter, newsletterRead } from "@/shared/db";
import type {
  NewNewsletter,
  NewsletterContentType,
  NewsletterFile,
  NewsletterSummary,
} from "./types";

// Never select `content` for lists; files can be several megabytes.
const summaryColumns = {
  id: newsletter.id,
  title: newsletter.title,
  summary: newsletter.summary,
  status: newsletter.status,
  scheduledAt: newsletter.scheduledAt,
  sentAt: newsletter.sentAt,
  fileName: newsletter.fileName,
  contentType: newsletter.contentType,
};

type SummaryRow = Omit<NewsletterSummary, "contentType"> & { contentType: string };

const toSummary = (row: SummaryRow): NewsletterSummary => ({
  ...row,
  contentType: row.contentType as NewsletterContentType,
});

export const listPublishedNewsletters = async (
  organisationId: string,
): Promise<NewsletterSummary[]> => {
  const rows = await getDb()
    .select(summaryColumns)
    .from(newsletter)
    .where(and(eq(newsletter.organisationId, organisationId), inArray(newsletter.status, ["sending", "sent"])))
    .orderBy(desc(sql`coalesce(${newsletter.sentAt}, ${newsletter.scheduledAt})`));
  return rows.map(toSummary);
};

export const listAllNewsletters = async (
  organisationId: string,
): Promise<NewsletterSummary[]> => {
  const rows = await getDb()
    .select(summaryColumns)
    .from(newsletter)
    .where(eq(newsletter.organisationId, organisationId))
    .orderBy(desc(newsletter.createdAt));
  return rows.map(toSummary);
};

export const getNextScheduledNewsletter = async (
  organisationId: string,
): Promise<NewsletterSummary | null> => {
  const [row] = await getDb()
    .select(summaryColumns)
    .from(newsletter)
    .where(
      and(
        eq(newsletter.organisationId, organisationId),
        eq(newsletter.status, "scheduled"),
        gt(newsletter.scheduledAt, new Date()),
      ),
    )
    .orderBy(asc(newsletter.scheduledAt))
    .limit(1);
  return row ? toSummary(row) : null;
};

export const getNewsletter = async (
  organisationId: string,
  newsletterId: string,
): Promise<NewsletterSummary | null> => {
  const [row] = await getDb()
    .select(summaryColumns)
    .from(newsletter)
    .where(and(eq(newsletter.organisationId, organisationId), eq(newsletter.id, newsletterId)))
    .limit(1);
  return row ? toSummary(row) : null;
};

export const getNewsletterFile = async (
  organisationId: string,
  newsletterId: string,
): Promise<NewsletterFile | null> => {
  const [row] = await getDb()
    .select({
      id: newsletter.id,
      title: newsletter.title,
      status: newsletter.status,
      fileName: newsletter.fileName,
      contentType: newsletter.contentType,
      content: newsletter.content,
    })
    .from(newsletter)
    .where(and(eq(newsletter.organisationId, organisationId), eq(newsletter.id, newsletterId)))
    .limit(1);
  return row ? { ...row, contentType: row.contentType as NewsletterContentType } : null;
};

export const createNewsletter = async (input: NewNewsletter): Promise<string> => {
  const [created] = await getDb()
    .insert(newsletter)
    .values({
      ...input,
      status: input.scheduledAt ? "scheduled" : "draft",
    })
    .returning({ id: newsletter.id });
  if (!created) throw new Error("Failed to create newsletter");
  return created.id;
};

// Only drafts and scheduled newsletters can be (re)scheduled or unscheduled.
export const setNewsletterSchedule = async (
  organisationId: string,
  newsletterId: string,
  scheduledAt: Date | null,
): Promise<boolean> => {
  const updated = await getDb()
    .update(newsletter)
    .set({ scheduledAt, status: scheduledAt ? "scheduled" : "draft" })
    .where(
      and(
        eq(newsletter.organisationId, organisationId),
        eq(newsletter.id, newsletterId),
        inArray(newsletter.status, ["draft", "scheduled"]),
      ),
    )
    .returning({ id: newsletter.id });
  return updated.length > 0;
};

export const deleteNewsletter = async (
  organisationId: string,
  newsletterId: string,
): Promise<boolean> => {
  const deleted = await getDb()
    .delete(newsletter)
    .where(
      and(
        eq(newsletter.organisationId, organisationId),
        eq(newsletter.id, newsletterId),
        inArray(newsletter.status, ["draft", "scheduled"]),
      ),
    )
    .returning({ id: newsletter.id });
  return deleted.length > 0;
};

// For background jobs only: not scoped to a viewer's organisation, so never
// call it with user-supplied ids.
export const getNewsletterForDelivery = async (
  newsletterId: string,
): Promise<(NewsletterFile & { organisationId: string; summary: string | null }) | null> => {
  const [row] = await getDb()
    .select({
      id: newsletter.id,
      organisationId: newsletter.organisationId,
      title: newsletter.title,
      summary: newsletter.summary,
      status: newsletter.status,
      fileName: newsletter.fileName,
      contentType: newsletter.contentType,
      content: newsletter.content,
    })
    .from(newsletter)
    .where(eq(newsletter.id, newsletterId))
    .limit(1);
  return row ? { ...row, contentType: row.contentType as NewsletterContentType } : null;
};

// Counted once per member; repeat visits are ignored.
export const recordNewsletterRead = async (newsletterId: string, membershipId: string): Promise<void> => {
  await getDb().insert(newsletterRead).values({ newsletterId, membershipId }).onConflictDoNothing();
};

// Number of members who opened each issue in the archive, by newsletter id.
export const countNewsletterReads = async (organisationId: string): Promise<Record<string, number>> => {
  const rows = await getDb()
    .select({ newsletterId: newsletterRead.newsletterId, readers: sql<number>`count(*)::int` })
    .from(newsletterRead)
    .innerJoin(newsletter, eq(newsletter.id, newsletterRead.newsletterId))
    .where(eq(newsletter.organisationId, organisationId))
    .groupBy(newsletterRead.newsletterId);
  return Object.fromEntries(rows.map(({ newsletterId, readers }) => [newsletterId, readers]));
};
