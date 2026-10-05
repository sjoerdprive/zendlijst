export type NewsletterStatus = "draft" | "scheduled" | "sending" | "sent";

export type NewsletterContentType = "text/html" | "application/pdf";

// editor: written in the team's rich-text editor · upload: an uploaded file.
// null: an empty draft.
export type NewsletterSource = "editor" | "upload";

export interface NewsletterSummary {
  id: string;
  title: string;
  summary: string | null;
  status: NewsletterStatus;
  scheduledAt: Date | null;
  sentAt: Date | null;
  source: NewsletterSource | null;
  fileName: string | null;
  contentType: NewsletterContentType | null;
  updatedAt: Date;
}

// Everything the editor page needs, without the (possibly large) file content.
export interface NewsletterDraft extends NewsletterSummary {
  body: EditorDocument | null;
  version: number;
  hasContent: boolean;
}

export interface NewsletterFile {
  id: string;
  title: string;
  status: NewsletterStatus;
  fileName: string;
  contentType: NewsletterContentType;
  content: Buffer;
}

export interface NewNewsletter {
  organisationId: string;
  title: string;
  summary: string | null;
  fileName: string;
  contentType: NewsletterContentType;
  content: Buffer;
  scheduledAt: Date | null;
  createdById: string;
}

export interface DraftChanges {
  title: string;
  summary: string | null;
  body: EditorDocument;
  // Rendered email HTML for `body`; null while the body is still empty, so an
  // empty draft can never be scheduled.
  content: Buffer | null;
}

export interface UploadedFile {
  fileName: string;
  contentType: NewsletterContentType;
  content: Buffer;
}

export type UploadProblem = "chooseFile" | "unsupportedType" | "tooLarge" | "invalidPdf";

export type SaveDraftResult = { status: "saved"; version: number } | { status: "conflict" | "locked" };

// A Tiptap JSON node, restricted to what the editor offers (see editorDocument.ts).
export interface EditorMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface EditorNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: EditorNode[];
  marks?: EditorMark[];
  text?: string;
}

export interface EditorDocument extends EditorNode {
  type: "doc";
}

export interface NewsletterStatusBadgeProps {
  status: NewsletterStatus;
}

export interface DraftCardProps {
  newsletter: NewsletterSummary;
  href: string;
  openNotes: number;
}

export interface NewsletterCardProps {
  newsletter: NewsletterSummary;
  href: string;
}
