import type { DeliveryStats } from "@/entities/delivery";
import type { NewsletterSummary } from "@/entities/newsletter";

export interface DeliveryBarProps {
  ratio: number;
}

export interface IssueMetrics {
  newsletter: NewsletterSummary;
  stats: DeliveryStats | null;
  readers: number;
}

export interface MetricsTableProps {
  issues: IssueMetrics[];
}
