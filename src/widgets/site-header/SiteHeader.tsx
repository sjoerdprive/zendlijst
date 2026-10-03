import Link from "next/link";
import type { SiteHeaderProps } from "./types";

export const SiteHeader = ({ brand, brandHref = "/", links, trailing }: SiteHeaderProps) => (
  <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
    <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <Link href={brandHref} className="text-lg font-semibold tracking-tight">
        {brand}
      </Link>
      <nav aria-label="Main" className="flex flex-wrap items-center gap-1 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg px-3 py-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {link.label}
          </Link>
        ))}
        {trailing}
      </nav>
    </div>
  </header>
);
