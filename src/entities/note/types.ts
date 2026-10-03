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
}

export interface NewNote {
  organisationId: string;
  authorId: string;
  body: string;
  newsletterId: string | null;
}

export interface NoteItemProps {
  note: Note;
  actions?: ReactNode;
}
