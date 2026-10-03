import type { ReactNode } from "react";

export interface SiteHeaderLink {
  href: string;
  label: string;
}

export interface SiteHeaderProps {
  brand: string;
  brandHref?: string;
  links: SiteHeaderLink[];
  trailing?: ReactNode;
}
