import type { SubscriptionMode } from "@/entities/organisation";

export interface QrImages {
  svg: string;
  png: string;
}

export interface ShareSubscribeCardProps {
  url: string;
  slug: string;
  organisationName: string;
  mode: SubscriptionMode;
}

export interface CopyLinkButtonProps {
  url: string;
}
