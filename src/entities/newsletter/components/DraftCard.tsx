"use client";

import Link from "next/link";
import { useDictionary, useLocale } from "@/shared/i18n";
import { cn, formatDateTime } from "@/shared/lib";
import type { DraftCardProps } from "../types";
import { newsletterDisplayTitle } from "../utils";

export const DraftCard = ({ newsletter, href, openNotes }: DraftCardProps) => {
  const t = useDictionary();
  const locale = useLocale();
  const kind =
    newsletter.source === "editor"
      ? t.newsletters.sources.editor
      : newsletter.source === "upload"
        ? newsletter.contentType === "application/pdf"
          ? t.newsletters.sources.pdf
          : t.newsletters.sources.html
        : t.newsletters.sources.empty;
  const untitled = !newsletter.title.trim();
  return (
    <Link
      href={href}
      className="group block h-full rounded-2xl border border-dashed border-line-strong bg-surface p-5 transition hover:border-brand/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{kind}</p>
      <h3
        className={cn(
          "mt-1.5 font-display text-lg font-semibold leading-snug group-hover:text-brand",
          untitled && "italic text-muted",
        )}
      >
        {newsletterDisplayTitle(newsletter.title, t.newsletters.untitled)}
      </h3>
      <p className="mt-2 text-xs text-muted">
        {t.newsletters.lastEdited(formatDateTime(newsletter.updatedAt, locale))}
        {openNotes > 0 && (
          <>
            {" · "}
            <span className="font-semibold text-accent-ink">{t.newsletters.openNotes(openNotes)}</span>
          </>
        )}
      </p>
    </Link>
  );
};
