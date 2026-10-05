import { getDeliveryStats } from "@/entities/delivery/server";
import { DraftCard, earliestDeliveryDate } from "@/entities/newsletter";
import { listAllNewsletters } from "@/entities/newsletter/server";
import { countOpenNotes, listNotesAwaitingDecision } from "@/entities/note/server";
import { NewDraftButton } from "@/features/edit-newsletter";
import { SentNotesPrompt } from "@/features/newsletter-notes";
import { NewsletterTable, UploadNewsletterForm, type NewsletterRow } from "@/features/publish-newsletter";
import { getDictionary } from "@/shared/i18n/server";
import { Card, EmptyState, Notice } from "@/shared/ui";
import { TeamShell } from "@/widgets/team-shell";
import { requireTeamAccess } from "@/widgets/team-shell/server";
import type { TeamNewslettersViewProps } from "./types";

export const TeamNewslettersView = async ({ sendingStarted }: TeamNewslettersViewProps) => {
  const { organisation, role } = await requireTeamAccess();
  const [newsletters, stats, openNotes, awaitingDecision, t] = await Promise.all([
    listAllNewsletters(organisation.id),
    getDeliveryStats(organisation.id),
    countOpenNotes(organisation.id),
    listNotesAwaitingDecision(organisation.id),
    getDictionary(),
  ]);
  const toRow = (newsletter: (typeof newsletters)[number]): NewsletterRow => ({
    newsletter,
    stats: stats[newsletter.id] ?? null,
  });
  // Most recently edited drafts first; scheduled in sending order; sent newest first.
  const drafts = newsletters
    .filter((newsletter) => newsletter.status === "draft")
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  const scheduled = newsletters
    .filter((newsletter) => newsletter.status === "scheduled")
    .sort((a, b) => (a.scheduledAt?.getTime() ?? 0) - (b.scheduledAt?.getTime() ?? 0));
  const sent = newsletters
    .filter((newsletter) => newsletter.status === "sending" || newsletter.status === "sent")
    .sort((a, b) => (b.sentAt ?? b.scheduledAt ?? b.updatedAt).getTime() - (a.sentAt ?? a.scheduledAt ?? a.updatedAt).getTime());

  return (
    <TeamShell role={role} title={t.newsletters.title} description={t.newsletters.description}>
      {sendingStarted && <Notice tone="success">{t.newsletters.sendingStarted}</Notice>}
      <SentNotesPrompt groups={awaitingDecision} />
      <Card title={t.newsletters.draftsTitle} actions={<NewDraftButton />}>
        {drafts.length === 0 ? (
          <EmptyState title={t.newsletters.draftsEmpty} />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {drafts.map((newsletter) => (
              <li key={newsletter.id}>
                <DraftCard
                  newsletter={newsletter}
                  href={`/team/newsletters/${newsletter.id}`}
                  openNotes={openNotes[newsletter.id] ?? 0}
                />
              </li>
            ))}
          </ul>
        )}
        <details className="mt-5 rounded-xl border border-line px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-brand">{t.newsletters.uploadToggle}</summary>
          <div className="mt-4">
            <UploadNewsletterForm earliestDate={earliestDeliveryDate()} />
          </div>
        </details>
      </Card>
      <Card title={t.newsletters.scheduledTitle}>
        <NewsletterTable rows={scheduled.map(toRow)} emptyTitle={t.newsletters.scheduledEmpty} showDelivery={false} />
      </Card>
      <Card title={t.newsletters.sentTitle}>
        <NewsletterTable rows={sent.map(toRow)} emptyTitle={t.newsletters.sentEmpty} />
      </Card>
    </TeamShell>
  );
};
