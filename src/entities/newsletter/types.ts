export type NewsletterStatus = "draft" | "scheduled" | "sending" | "sent";

export type NewsletterContentType = "text/html" | "application/pdf";

export interface NewsletterSummary {
  id: string;
  title: string;
  summary: string | null;
  status: NewsletterStatus;
  scheduledAt: Date | null;
  sentAt: Date | null;
  fileName: string;
  contentType: NewsletterContentType;
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

export interface NewsletterStatusBadgeProps {
  status: NewsletterStatus;
}

export interface NewsletterCardProps {
  newsletter: NewsletterSummary;
  href: string;
}
