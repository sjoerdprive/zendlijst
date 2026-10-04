"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDictionary } from "@/shared/i18n";
import { cn } from "@/shared/lib";
import type { TeamNavItem, TeamNavProps } from "./types";

const ITEMS: TeamNavItem[] = [
  { href: "/team", labelKey: "overview", adminOnly: false },
  { href: "/team/newsletters", labelKey: "newsletters", adminOnly: false },
  { href: "/team/notes", labelKey: "notes", adminOnly: false },
  { href: "/team/metrics", labelKey: "metrics", adminOnly: false },
  { href: "/team/subscribers", labelKey: "subscribers", adminOnly: true },
  { href: "/team/writers", labelKey: "writers", adminOnly: true },
  { href: "/team/organisation", labelKey: "organisation", adminOnly: true },
];

// Strips the internal "/t/<slug>" prefix in case the rewritten path leaks through.
const visiblePath = (pathname: string) => pathname.replace(/^\/t\/[^/]+/, "") || "/";

export const TeamNav = ({ role }: TeamNavProps) => {
  const t = useDictionary();
  const pathname = visiblePath(usePathname());
  return (
    <nav aria-label={t.teamNav.label} className="flex gap-1 overflow-x-auto rounded-full border border-line bg-surface p-1 shadow-sm shadow-ink/5">
      {ITEMS.filter((item) => role === "admin" || !item.adminOnly).map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              active ? "bg-brand text-on-brand shadow-sm" : "text-muted hover:bg-brand-soft hover:text-brand",
            )}
          >
            {t.teamNav[item.labelKey]}
          </Link>
        );
      })}
    </nav>
  );
};
