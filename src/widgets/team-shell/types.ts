import type { ReactNode } from "react";
import type { TeamRole } from "@/entities/membership";
import type { Dictionary } from "@/shared/i18n";

export interface TeamShellProps {
  role: TeamRole;
  title: string;
  description?: string;
  children: ReactNode;
}

export interface TeamNavProps {
  role: TeamRole;
}

export interface TeamNavItem {
  href: string;
  labelKey: Exclude<keyof Dictionary["teamNav"], "label">;
  adminOnly: boolean;
}
