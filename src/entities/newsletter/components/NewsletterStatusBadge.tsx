import { Badge } from "@/shared/ui";
import type { BadgeTone } from "@/shared/ui";
import type { NewsletterStatus, NewsletterStatusBadgeProps } from "../types";

const STATUS_TONES: Record<NewsletterStatus, BadgeTone> = {
  draft: "neutral",
  scheduled: "info",
  sending: "warning",
  sent: "success",
};

export const NewsletterStatusBadge = ({ status }: NewsletterStatusBadgeProps) => (
  <Badge tone={STATUS_TONES[status]}>{status}</Badge>
);
