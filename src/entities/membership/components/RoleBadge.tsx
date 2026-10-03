"use client";

import { useDictionary } from "@/shared/i18n";
import { Badge } from "@/shared/ui";
import type { BadgeTone } from "@/shared/ui";
import type { MemberRole, RoleBadgeProps } from "../types";

const ROLE_TONES: Record<MemberRole, BadgeTone> = {
  admin: "info",
  writer: "warning",
  subscriber: "neutral",
};

export const RoleBadge = ({ role }: RoleBadgeProps) => {
  const t = useDictionary();
  return <Badge tone={ROLE_TONES[role]}>{t.roles[role]}</Badge>;
};
