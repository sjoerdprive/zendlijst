export type SubscriptionMode = "open" | "approval" | "closed";

export interface Organisation {
  id: string;
  slug: string;
  name: string;
  subscriptionMode: SubscriptionMode;
}

export type OrganisationRequestStatus = "pending" | "approved" | "rejected";

export interface OrganisationRequest {
  id: string;
  organisationName: string;
  slug: string;
  adminEmail: string;
  message: string | null;
  status: OrganisationRequestStatus;
  createdAt: Date;
}

export interface NewOrganisationRequest {
  organisationName: string;
  slug: string;
  adminEmail: string;
  message?: string;
}
