import "server-only";
import { getNextScheduledNewsletter } from "@/entities/newsletter/server";
import type { NoteTarget } from "@/entities/note";

// "The next newsletter": the earliest scheduled issue, or else the next draft
// that gets created.
export const nextNoteTarget = async (organisationId: string): Promise<NoteTarget> => {
  const next = await getNextScheduledNewsletter(organisationId);
  return next ? { newsletterId: next.id } : { forNextDraft: true };
};
