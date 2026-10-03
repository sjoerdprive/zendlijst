export type DeliveryStatus = "pending" | "sent" | "failed";

export interface FailedDelivery {
  id: string;
  newsletterId: string;
  newsletterTitle: string;
  email: string;
  attempts: number;
  lastError: string | null;
  failedAt: Date;
}

export interface DeliveryStats {
  pending: number;
  sent: number;
  failed: number;
  resolved: number;
}
