import { getDictionary, getLocale } from "@/shared/i18n/server";
import { formatDateTime } from "@/shared/lib";
import type { NextIssueProps } from "./types";

export const NextIssue = async ({ next }: NextIssueProps) => {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <div className="relative overflow-hidden rounded-2xl bg-brand p-6 text-on-brand shadow-lg shadow-brand/20">
      <span aria-hidden="true" className="absolute -bottom-16 -right-10 size-44 rounded-full bg-accent" />
      <span aria-hidden="true" className="absolute -bottom-6 right-24 size-16 rounded-full border-4 border-on-brand/25" />
      <p className="relative text-xs font-semibold uppercase tracking-widest opacity-80">{t.archive.nextIssue}</p>
      <p className="relative mt-1 font-display text-2xl font-semibold">
        {next?.scheduledAt ? (
          <time dateTime={next.scheduledAt.toISOString()}>{formatDateTime(next.scheduledAt, locale)}</time>
        ) : (
          t.archive.notScheduled
        )}
      </p>
    </div>
  );
};
