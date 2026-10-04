import type { MemberWithEmail, SubscriptionRequest } from "@/entities/membership";

export interface SubscriptionRequestListProps {
  requests: SubscriptionRequest[];
}

export interface SubscriptionRequestItemProps {
  request: SubscriptionRequest;
  formAction: (formData: FormData) => void;
}

export interface SubscriberTableProps {
  members: MemberWithEmail[];
}

export interface RemoveSubscriberButtonProps {
  membershipId: string;
  email: string;
}
