import type { NewsletterSummary } from "@/entities/newsletter";
import type { Note, SentNewsletterNotes } from "@/entities/note";

export interface NoteFormProps {
  // Drafts and scheduled issues a note can be linked to.
  newsletters: NewsletterSummary[];
}

export interface QuickNoteFormProps {
  newsletterId: string;
}

export interface NoteBoardProps {
  notes: Note[];
  newsletters: NewsletterSummary[];
}

export interface ArchivedNoteListProps {
  notes: Note[];
}

export interface NoteActionsProps {
  note: Note;
}

export interface NewsletterNotesPanelProps {
  newsletterId: string;
  notes: Note[];
  // Sent issues show their notes read-only; the decision card handles them.
  canAdd: boolean;
}

export interface SentNotesPromptProps {
  groups: SentNewsletterNotes[];
}

export interface SentNotesDecisionProps {
  group: SentNewsletterNotes;
}
