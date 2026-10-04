export type MemberRole = "admin" | "writer" | "subscriber";

export type TeamRole = Exclude<MemberRole, "subscriber">;

export interface Membership {
  id: string;
  organisationId: string;
  userId: string;
  role: MemberRole;
  emailNotifications: boolean;
}

export interface Viewer {
  userId: string;
  email: string;
  membership: Membership | null;
}

export interface MemberWithEmail {
  id: string;
  userId: string;
  email: string;
  role: MemberRole;
  emailNotifications: boolean;
  createdAt: Date;
}

export interface Recipient {
  membershipId: string;
  email: string;
}

export type AddMemberResult =
  | { status: "added"; membershipId: string }
  | { status: "updated"; membershipId: string }
  | { status: "already-member" }
  | { status: "writer-limit-reached" };

export interface RoleBadgeProps {
  role: MemberRole;
}

export interface SubscriptionRequest {
  id: string;
  email: string;
  emailNotifications: boolean;
  createdAt: Date;
}

export interface ApprovedRequest {
  email: string | null;
}
