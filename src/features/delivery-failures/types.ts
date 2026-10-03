import type { FailedDelivery } from "@/entities/delivery";

export interface FailurePanelProps {
  failures: FailedDelivery[];
}

export interface FailureGroupProps {
  newsletterId: string;
  newsletterTitle: string;
  failures: FailedDelivery[];
}

export interface ResolveButtonProps {
  deliveryIds: string[];
  label: string;
}

export interface CopyEmailsButtonProps {
  emails: string[];
}
