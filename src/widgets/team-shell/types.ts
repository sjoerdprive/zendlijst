import type { ReactNode } from "react";
import type { TeamRole } from "@/entities/membership";

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
  label: string;
  adminOnly: boolean;
}
