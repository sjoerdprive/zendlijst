"use client";

import { useDictionary } from "@/shared/i18n";
import { Badge } from "@/shared/ui";
import type { BadgeTone } from "@/shared/ui";
import type { NewsletterStatus, NewsletterStatusBadgeProps } from "../types";

const STATUS_TONES: Record<NewsletterStatus, BadgeTone> = {
  draft: "neutral",
  scheduled: "info",
  sending: "warning",
  sent: "success",
};

export const NewsletterStatusBadge = ({ status }: NewsletterStatusBadgeProps) => {
  const t = useDictionary();
  return <Badge tone={STATUS_TONES[status]}>{t.newsletters.statuses[status]}</Badge>;
};
