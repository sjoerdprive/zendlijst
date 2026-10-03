import type { MemberWithEmail } from "@/entities/membership";

export interface SubscriberTableProps {
  members: MemberWithEmail[];
}

export interface RemoveSubscriberButtonProps {
  membershipId: string;
  email: string;
}
