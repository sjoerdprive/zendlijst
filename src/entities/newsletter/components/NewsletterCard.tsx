"use client";

import Link from "next/link";
import { useDictionary, useLocale } from "@/shared/i18n";
import { formatDate } from "@/shared/lib";
import type { NewsletterCardProps } from "../types";
import { publishedAt } from "../utils";

export const NewsletterCard = ({ newsletter, href }: NewsletterCardProps) => {
  const t = useDictionary();
  const locale = useLocale();
  const date = publishedAt(newsletter);
  return (
    <Link
      href={href}
      className="group relative block h-full overflow-hidden rounded-2xl border border-line bg-surface p-5 pl-6 shadow-sm shadow-ink/5 transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-accent transition-colors group-hover:bg-brand" />
      <p className="text-xs font-semibold uppercase tracking-wider text-accent-ink">
        {date ? formatDate(date, locale) : t.archive.unscheduled} ·{" "}
        {newsletter.contentType === "application/pdf" ? t.archive.pdf : t.archive.web}
      </p>
      <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug group-hover:text-brand">{newsletter.title}</h3>
      {newsletter.summary && <p className="mt-1 line-clamp-2 text-sm text-muted">{newsletter.summary}</p>}
    </Link>
  );
};
