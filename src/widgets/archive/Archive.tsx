import { NewsletterCard } from "@/entities/newsletter";
import { getDictionary } from "@/shared/i18n/server";
import { EmptyState } from "@/shared/ui";
import { NextIssue } from "./NextIssue";
import type { ArchiveProps } from "./types";

export const Archive = async ({ published, next }: ArchiveProps) => {
  const t = await getDictionary();
  return (
    <section className="space-y-8">
      <NextIssue next={next} />
      <div className="space-y-4">
        <h2 className="flex items-center gap-3 font-display text-2xl font-semibold tracking-tight">
          {t.archive.title}
          <span aria-hidden="true" className="h-px flex-1 bg-line-strong" />
        </h2>
        {published.length === 0 ? (
          <EmptyState title={t.archive.emptyTitle}>{t.archive.emptyBody}</EmptyState>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {published.map((newsletter) => (
              <li key={newsletter.id}>
                <NewsletterCard newsletter={newsletter} href={`/newsletters/${newsletter.id}`} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
