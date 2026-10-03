import Link from "next/link";
import { LocaleSwitcher } from "@/features/switch-locale";
import { getDictionary } from "@/shared/i18n/server";
import type { SiteHeaderProps } from "./types";

export const SiteHeader = async ({ brand, brandHref = "/", links, trailing }: SiteHeaderProps) => {
  const t = await getDictionary();
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/85 backdrop-blur">
      <div aria-hidden="true" className="h-1 bg-linear-to-r from-brand from-60% to-accent" />
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href={brandHref}
          className="flex items-center gap-2.5 rounded-lg font-display text-xl font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-lg bg-brand text-base text-on-brand shadow-sm shadow-brand/30"
          >
            {brand.charAt(0).toUpperCase()}
          </span>
          <span>
            {brand}
            <span aria-hidden="true" className="text-accent">
              .
            </span>
          </span>
        </Link>
        <nav aria-label={t.header.mainNav} className="flex flex-wrap items-center gap-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 font-medium text-muted transition-colors hover:bg-brand-soft hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
          {trailing}
          <div className="ml-1">
            <LocaleSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
};
