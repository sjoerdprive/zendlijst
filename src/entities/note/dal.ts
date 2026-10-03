import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { decryptEmail } from "@/shared/crypto";
import { getDb, newsletter, note, user } from "@/shared/db";
import type { NewNote, Note } from "./types";

export const listNotes = async (organisationId: string): Promise<Note[]> => {
  const rows = await getDb()
    .select({
      id: note.id,
      body: note.body,
      done: note.done,
      createdAt: note.createdAt,
      authorId: note.authorId,
      authorEmailEncrypted: user.emailEncrypted,
      newsletterId: note.newsletterId,
      newsletterTitle: newsletter.title,
    })
    .from(note)
    .leftJoin(user, eq(user.id, note.authorId))
    .leftJoin(newsletter, eq(newsletter.id, note.newsletterId))
    .where(eq(note.organisationId, organisationId))
    .orderBy(asc(note.done), desc(note.createdAt));
  return rows.map(({ authorEmailEncrypted, ...row }) => ({
    ...row,
    authorEmail: authorEmailEncrypted ? decryptEmail(authorEmailEncrypted) : null,
  }));
};

export const createNote = async (input: NewNote): Promise<void> => {
  await getDb().insert(note).values(input);
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
