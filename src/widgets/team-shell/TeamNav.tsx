"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib";
import type { TeamNavItem, TeamNavProps } from "./types";

const ITEMS: TeamNavItem[] = [
  { href: "/team", label: "Overview", adminOnly: false },
  { href: "/team/newsletters", label: "Newsletters", adminOnly: false },
  { href: "/team/notes", label: "Notes", adminOnly: false },
  { href: "/team/subscribers", label: "Subscribers", adminOnly: true },
  { href: "/team/writers", label: "Writers", adminOnly: true },
];

// Strips the internal "/t/<slug>" prefix in case the rewritten path leaks through.
const visiblePath = (pathname: string) => pathname.replace(/^\/t\/[^/]+/, "") || "/";

export const TeamNav = ({ role }: TeamNavProps) => {
  const pathname = visiblePath(usePathname());
  return (
    <nav aria-label="Team" className="flex gap-1 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800">
      {ITEMS.filter((item) => role === "admin" || !item.adminOnly).map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm",
              active
                ? "border-zinc-900 font-medium text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
