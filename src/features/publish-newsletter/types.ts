import type { DeliveryStats } from "@/entities/delivery";
import type { NewsletterSummary } from "@/entities/newsletter";

export type PublishMode = "schedule" | "now" | "draft";

export interface NewsletterRow {
  newsletter: NewsletterSummary;
  stats: DeliveryStats | null;
}

export interface NewsletterTableProps {
  rows: NewsletterRow[];
  // First "YYYY-MM-DD" that can still be scheduled (Dutch time).
  earliestDate: string;
}

export interface NewsletterRowActionsProps {
  newsletter: NewsletterSummary;
  earliestDate: string;
}

export interface UploadNewsletterFormProps {
  earliestDate: string;
}

export interface DeliveryProgressProps {
  stats: DeliveryStats | null;
}
