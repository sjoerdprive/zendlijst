import { NewsletterCard } from "@/entities/newsletter";
import { EmptyState } from "@/shared/ui";
import { NextIssue } from "./NextIssue";
import type { ArchiveProps } from "./types";

export const Archive = ({ published, next }: ArchiveProps) => (
  <section className="space-y-6">
    <NextIssue next={next} />
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Archive</h2>
      {published.length === 0 ? (
        <EmptyState title="No issues published yet.">The first one is on its way.</EmptyState>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
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
