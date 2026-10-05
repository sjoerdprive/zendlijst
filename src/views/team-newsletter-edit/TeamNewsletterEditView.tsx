import Link from "next/link";
import { notFound } from "next/navigation";
import { earliestDeliveryDate, isEditable, newsletterDisplayTitle } from "@/entities/newsletter";
import { getNewsletterDraft } from "@/entities/newsletter/server";
import { listNotesAwaitingDecision, listNotesForNewsletter } from "@/entities/note/server";
import { NewsletterEditor } from "@/features/edit-newsletter";
import { NewsletterNotesPanel, SentNotesPrompt } from "@/features/newsletter-notes";
import { getDictionary, getLocale } from "@/shared/i18n/server";
import { formatDateTime } from "@/shared/lib";
import { buttonClasses, Card, Notice } from "@/shared/ui";
import { TeamShell } from "@/widgets/team-shell";
import { requireTeamAccess } from "@/widgets/team-shell/server";
import type { TeamNewsletterEditViewProps } from "./types";

export const TeamNewsletterEditView = async ({ newsletterId }: TeamNewsletterEditViewProps) => {
  const { organisation, role } = await requireTeamAccess();
  const [draft, notes, t, locale] = await Promise.all([
    getNewsletterDraft(organisation.id, newsletterId),
    listNotesForNewsletter(organisation.id, newsletterId),
    getDictionary(),
    getLocale(),
  ]);
  if (!draft) notFound();

  const editable = isEditable(draft.status);
  const heading = editable
    ? draft.status === "scheduled"
      ? t.editor.titleScheduled
      : t.editor.titleDraft
    : t.editor.titleSent;
  const decision = draft.status === "sent"
    ? (await listNotesAwaitingDecision(organisation.id)).filter((group) => group.newsletterId === draft.id)
    : [];

  return (
    <TeamShell role={role} title={heading}>
      <Link href="/team/newsletters" className="-mt-2 inline-block text-sm font-semibold text-brand hover:underline">
        ← {t.editor.back}
      </Link>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        {editable ? (
          <NewsletterEditor draft={draft} earliestDate={earliestDeliveryDate()} />
        ) : (
          <Card title={newsletterDisplayTitle(draft.title, t.newsletters.untitled)}>
            <div className="space-y-4">
              {draft.status === "sending" ? (
                <Notice>{t.editor.sending}</Notice>
              ) : (
                draft.sentAt && <p className="text-sm text-muted">{t.editor.sentOn(formatDateTime(draft.sentAt, locale))}</p>
              )}
              <Link href={`/newsletters/${draft.id}`} className={buttonClasses("secondary")}>
                {t.editor.viewInArchive}
              </Link>
            </div>
          </Card>
        )}
        <aside className="space-y-4 lg:sticky lg:top-6">
          {decision.length > 0 ? (
            <SentNotesPrompt groups={decision} />
          ) : (
            <Card title={t.notes.panelTitle}>
              <NewsletterNotesPanel newsletterId={draft.id} notes={notes} canAdd={editable} />
            </Card>
          )}
        </aside>
      </div>
    </TeamShell>
  );
};
