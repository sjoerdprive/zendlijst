import type { Dictionary } from "@/shared/i18n";
import type { NewsletterContentType, NewsletterStatus, NewsletterSummary, UploadProblem } from "./types";

// Vercel rejects request bodies over 4.5 MB, so uploads stay under that.
export const MAX_NEWSLETTER_BYTES = 4 * 1024 * 1024;

export const NEWSLETTER_CONTENT_TYPES: Record<string, NewsletterContentType> = {
  ".html": "text/html",
  ".htm": "text/html",
  ".pdf": "application/pdf",
};

export const ACCEPTED_NEWSLETTER_EXTENSIONS = Object.keys(NEWSLETTER_CONTENT_TYPES).join(",");

export const contentTypeForFileName = (fileName: string): NewsletterContentType | null => {
  const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  return NEWSLETTER_CONTENT_TYPES[extension] ?? null;
};

export const isPublished = (status: NewsletterStatus): boolean =>
  status === "sending" || status === "sent";

export const isEditable = (status: NewsletterStatus): boolean =>
  status === "draft" || status === "scheduled";

// Drafts may be untitled; the UI shows a placeholder instead of an empty title.
export const newsletterDisplayTitle = (title: string, untitled: string): string => title.trim() || untitled;

export const publishedAt = (newsletter: NewsletterSummary): Date | null =>
  newsletter.sentAt ?? newsletter.scheduledAt;

// Form-level message and the short hint shown under the file field.
export const describeUploadProblem = (problem: UploadProblem, t: Dictionary): { message: string; field: string } => {
  switch (problem) {
    case "chooseFile":
      return { message: t.newsletters.chooseFile, field: t.newsletters.chooseFile };
    case "unsupportedType":
      return { message: t.newsletters.unsupportedType, field: t.newsletters.useHtmlOrPdf };
    case "tooLarge":
      return { message: t.newsletters.tooLarge, field: t.newsletters.maxSize };
    case "invalidPdf":
      return { message: t.newsletters.invalidPdf, field: t.newsletters.invalidPdf };
  }
};
