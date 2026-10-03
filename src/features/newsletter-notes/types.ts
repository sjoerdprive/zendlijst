import type { NewsletterSummary } from "@/entities/newsletter";
import type { Note } from "@/entities/note";

export interface NoteFormProps {
  newsletters: NewsletterSummary[];
}

export interface NoteBoardProps {
  notes: Note[];
  newsletters: NewsletterSummary[];
}

export interface NoteActionsProps {
  note: Note;
}
