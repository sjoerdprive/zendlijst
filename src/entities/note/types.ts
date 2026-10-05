import type { ReactNode } from "react";

export interface Note {
  id: string;
  body: string;
  done: boolean;
  createdAt: Date;
  authorId: string | null;
  authorEmail: string | null;
  newsletterId: string | null;
  newsletterTitle: string | null;
  // Status of the linked newsletter (entities don't import each other).
  newsletterStatus: "draft" | "scheduled" | "sending" | "sent" | null;
  // Waits for the next draft that gets created.
  forNextDraft: boolean;
  archivedAt: Date | null;
}

export interface NewNote {
  organisationId: string;
  authorId: string;
  body: string;
  newsletterId: string | null;
  forNextDraft: boolean;
}

// Where a note goes: a specific newsletter, the next draft, or nowhere (general).
export type NoteTarget = { newsletterId: string } | { forNextDraft: true } | { general: true };

// Notes of one sent newsletter, or a single note of it.
export interface NoteSelection {
  newsletterId: string;
  noteId?: string;
}

export interface SentNewsletterNotes {
  newsletterId: string;
  newsletterTitle: string;
  sentAt: Date | null;
  notes: Note[];
}

export interface NoteItemProps {
  note: Note;
  actions?: ReactNode;
  // Off where notes are already grouped by newsletter.
  showNewsletter?: boolean;
  // Actions under the text instead of beside it, for narrow columns.
  stacked?: boolean;
}
