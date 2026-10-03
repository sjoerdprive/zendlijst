import type { OrganisationRequest } from "@/entities/organisation";

export interface RequestReviewListProps {
  requests: OrganisationRequest[];
  rootDomain: string;
}

export interface RequestReviewItemProps {
  request: OrganisationRequest;
  rootDomain: string;
}
