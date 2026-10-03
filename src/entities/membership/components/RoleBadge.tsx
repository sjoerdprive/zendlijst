import { Badge } from "@/shared/ui";
import type { BadgeTone } from "@/shared/ui";
import type { MemberRole, RoleBadgeProps } from "../types";

const ROLE_TONES: Record<MemberRole, BadgeTone> = {
  admin: "info",
  writer: "success",
  subscriber: "neutral",
};

export const RoleBadge = ({ role }: RoleBadgeProps) => (
  <Badge tone={ROLE_TONES[role]}>{role}</Badge>
);
