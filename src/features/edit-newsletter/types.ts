import type { EditorDocument, NewsletterDraft } from "@/entities/newsletter";

export interface SaveDraftInput {
  newsletterId: string;
  // Version the editor last saw; a newer one in the database means a conflict.
  version: number;
  title: string;
  summary: string;
  // Editor JSON as a string; null for drafts that carry an uploaded file.
  body: string | null;
}

export type SaveDraftResponse =
  | { status: "saved"; version: number; hasContent: boolean }
  | { status: "conflict" | "locked" }
  | { status: "error"; message: string };

export type SaveState = "saved" | "unsaved" | "saving" | "error" | "conflict" | "locked";

export interface NewsletterEditorProps {
  draft: NewsletterDraft;
  // First "YYYY-MM-DD" that can still be scheduled (Dutch time).
  earliestDate: string;
}

export interface RichTextEditorProps {
  initialContent: EditorDocument | null;
  // Read-only after a save conflict, so the text can still be copied.
  editable: boolean;
  onChange: (document: EditorDocument) => void;
  label: string;
  placeholder: string;
}

export interface FileSectionProps {
  newsletterId: string;
  fileName: string | null;
  // Removing the file is only possible for drafts.
  canRemove: boolean;
  flush: () => Promise<boolean>;
}

export interface AttachFileFormProps {
  newsletterId: string;
  // Warn before a file replaces written text.
  replacesText: boolean;
  label: string;
  flush: () => Promise<boolean>;
}

export interface NewsletterPreviewProps {
  newsletterId: string;
  isHtml: boolean;
  hasContent: boolean;
  // Changes after every save so the frame reloads.
  version: number;
}

export interface SendPanelProps {
  newsletterId: string;
  title: string;
  status: NewsletterDraft["status"];
  scheduledAt: Date | null;
  earliestDate: string;
  // Saves pending edits first; false when that failed.
  flush: () => Promise<boolean>;
  // Drops pending edits (the newsletter is about to be deleted).
  discard: () => void;
}
