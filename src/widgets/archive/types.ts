import type { NewsletterSummary } from "@/entities/newsletter";

export interface ArchiveProps {
  published: NewsletterSummary[];
  next: NewsletterSummary | null;
}

export interface NextIssueProps {
  next: NewsletterSummary | null;
}
