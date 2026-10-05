import "server-only";
import { and, asc, desc, eq, isNotNull, isNull, sql, type SQL } from "drizzle-orm";
import { decryptEmail } from "@/shared/crypto";
import { getDb, newsletter, note, user } from "@/shared/db";
import type { NewNote, Note, NoteSelection, NoteTarget, SentNewsletterNotes } from "./types";

const noteColumns = {
  id: note.id,
  body: note.body,
  done: note.done,
  createdAt: note.createdAt,
  authorId: note.authorId,
  authorEmailEncrypted: user.emailEncrypted,
  newsletterId: note.newsletterId,
  newsletterTitle: newsletter.title,
  newsletterStatus: newsletter.status,
  forNextDraft: note.forNextDraft,
  archivedAt: note.archivedAt,
};

type NoteRow = Omit<Note, "authorEmail"> & { authorEmailEncrypted: string | null };

const toNote = ({ authorEmailEncrypted, ...row }: NoteRow): Note => ({
  ...row,
  authorEmail: authorEmailEncrypted ? decryptEmail(authorEmailEncrypted) : null,
});

const selectNotes = async (where: SQL | undefined, order = [asc(note.done), desc(note.createdAt)]): Promise<Note[]> => {
  const rows = await getDb()
    .select(noteColumns)
    .from(note)
    .leftJoin(user, eq(user.id, note.authorId))
    .leftJoin(newsletter, eq(newsletter.id, note.newsletterId))
    .where(where)
    .orderBy(...order);
  return rows.map(toNote);
};

export const listNotes = async (organisationId: string, options: { archived?: boolean } = {}): Promise<Note[]> =>
  selectNotes(
    and(
      eq(note.organisationId, organisationId),
      options.archived ? isNotNull(note.archivedAt) : isNull(note.archivedAt),
    ),
    options.archived ? [desc(note.archivedAt)] : undefined,
  );

export const listNotesForNewsletter = async (organisationId: string, newsletterId: string): Promise<Note[]> =>
  selectNotes(
    and(eq(note.organisationId, organisationId), eq(note.newsletterId, newsletterId), isNull(note.archivedAt)),
  );

// Open (not done, not archived) notes per newsletter id.
export const countOpenNotes = async (organisationId: string): Promise<Record<string, number>> => {
  const rows = await getDb()
    .select({ newsletterId: note.newsletterId, open: sql<number>`count(*)::int` })
    .from(note)
    .where(
      and(
        eq(note.organisationId, organisationId),
        isNotNull(note.newsletterId),
        eq(note.done, false),
        isNull(note.archivedAt),
      ),
    )
    .groupBy(note.newsletterId);
  return Object.fromEntries(rows.map(({ newsletterId, open }) => [newsletterId, open]));
};

// Sent newsletters whose notes still wait for a decision (archive, delete or take along).
export const listNotesAwaitingDecision = async (organisationId: string): Promise<SentNewsletterNotes[]> => {
  const rows = await getDb()
    .select({ ...noteColumns, sentAt: newsletter.sentAt })
    .from(note)
    .innerJoin(newsletter, eq(newsletter.id, note.newsletterId))
    .leftJoin(user, eq(user.id, note.authorId))
    .where(and(eq(note.organisationId, organisationId), isNull(note.archivedAt), eq(newsletter.status, "sent")))
    .orderBy(desc(newsletter.sentAt), asc(note.done), asc(note.createdAt));
  const groups = new Map<string, SentNewsletterNotes>();
  for (const { sentAt, ...row } of rows) {
    const item = toNote(row);
    const newsletterId = row.newsletterId ?? "";
    const group = groups.get(newsletterId) ?? {
      newsletterId,
      newsletterTitle: row.newsletterTitle ?? "",
      sentAt,
      notes: [],
    };
    group.notes.push(item);
    groups.set(newsletterId, group);
  }
  return [...groups.values()];
};

export const createNote = async (input: NewNote): Promise<void> => {
  await getDb().insert(note).values(input);
};

// A new draft picks up the notes that were waiting for it.
export const linkWaitingNotesToDraft = async (organisationId: string, draftId: string): Promise<void> => {
  await getDb()
    .update(note)
    .set({ newsletterId: draftId, forNextDraft: false })
    .where(and(eq(note.organisationId, organisationId), eq(note.forNextDraft, true), isNull(note.archivedAt)));
};

export const setNoteDone = async (
  organisationId: string,
  noteId: string,
  done: boolean,
): Promise<void> => {
  await getDb()
    .update(note)
    .set({ done })
    .where(and(eq(note.organisationId, organisationId), eq(note.id, noteId)));
};

export const deleteNote = async (organisationId: string, noteId: string): Promise<void> => {
  await getDb()
    .delete(note)
    .where(and(eq(note.organisationId, organisationId), eq(note.id, noteId)));
};

export const archiveNote = async (organisationId: string, noteId: string): Promise<void> => {
  await getDb()
    .update(note)
    .set({ archivedAt: new Date(), forNextDraft: false })
    .where(and(eq(note.organisationId, organisationId), eq(note.id, noteId)));
};

export const restoreNote = async (organisationId: string, noteId: string): Promise<void> => {
  await getDb()
    .update(note)
    .set({ archivedAt: null })
    .where(and(eq(note.organisationId, organisationId), eq(note.id, noteId)));
};

const selectionWhere = (organisationId: string, selection: NoteSelection) =>
  and(
    eq(note.organisationId, organisationId),
    eq(note.newsletterId, selection.newsletterId),
    isNull(note.archivedAt),
    selection.noteId ? eq(note.id, selection.noteId) : undefined,
  );

export const archiveNotes = async (organisationId: string, selection: NoteSelection): Promise<void> => {
  await getDb().update(note).set({ archivedAt: new Date() }).where(selectionWhere(organisationId, selection));
};

export const deleteNotes = async (organisationId: string, selection: NoteSelection): Promise<void> => {
  await getDb().delete(note).where(selectionWhere(organisationId, selection));
};

const targetValues = (target: NoteTarget) =>
  "newsletterId" in target
    ? { newsletterId: target.newsletterId, forNextDraft: false }
    : { newsletterId: null, forNextDraft: "forNextDraft" in target };

// Takes open notes along to `target`; notes already marked done are archived
// for a single bulk decision, since they need no follow-up.
export const moveNotes = async (
  organisationId: string,
  selection: NoteSelection,
  target: NoteTarget,
): Promise<void> => {
  await getDb().transaction(async (tx) => {
    const where = selectionWhere(organisationId, selection);
    if (!selection.noteId) {
      await tx.update(note).set({ archivedAt: new Date() }).where(and(where, eq(note.done, true)));
    }
    await tx.update(note).set({ ...targetValues(target), done: false }).where(where);
  });
};
