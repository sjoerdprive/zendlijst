import type { NewsletterContentType, NewsletterStatus, NewsletterSummary } from "./types";

export const MAX_NEWSLETTER_BYTES = 8 * 1024 * 1024;

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

export const publishedAt = (newsletter: NewsletterSummary): Date | null =>
  newsletter.sentAt ?? newsletter.scheduledAt;
