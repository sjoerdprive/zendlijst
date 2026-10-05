import Link from "next/link";
import { listUnresolvedFailures } from "@/entities/delivery/server";
import { countSubscriptionRequests, listMembers } from "@/entities/membership/server";
import { DELIVERY_HOUR, DELIVERY_WINDOW_END_HOUR, deliveryMomentFor, newsletterDisplayTitle } from "@/entities/newsletter";
import { getNextScheduledNewsletter, listAllNewsletters } from "@/entities/newsletter/server";
import { listNotes, listNotesAwaitingDecision } from "@/entities/note/server";
import { FailurePanel } from "@/features/delivery-failures";
import { SentNotesPrompt } from "@/features/newsletter-notes";
import { ShareSubscribeCard } from "@/features/share-subscribe-link";
import { organisationUrl } from "@/shared/config";
import { getDictionary, getLocale } from "@/shared/i18n/server";
import { formatDate } from "@/shared/lib";
import { buttonClasses, Notice, StatTile } from "@/shared/ui";
import { TeamShell } from "@/widgets/team-shell";
import { requireTeamAccess } from "@/widgets/team-shell/server";

export const TeamOverviewView = async () => {
  const { organisation, role } = await requireTeamAccess();
  const [failures, members, next, newsletters, notes, awaitingDecision, requestCount, t, locale] = await Promise.all([
    listUnresolvedFailures(organisation.id),
    listMembers(organisation.id, ["admin", "writer", "subscriber"]),
    getNextScheduledNewsletter(organisation.id),
    listAllNewsletters(organisation.id),
    listNotes(organisation.id),
    listNotesAwaitingDecision(organisation.id),
    role === "admin" ? countSubscriptionRequests(organisation.id) : Promise.resolve(0),
    getDictionary(),
    getLocale(),
  ]);
  const optedIn = members.filter((member) => member.emailNotifications).length;
  const drafts = newsletters.filter((newsletter) => newsletter.status === "draft").length;
  const openNotes = notes.filter((note) => !note.done).length;

  return (
    <TeamShell role={role} title={t.overview.title} description={t.overview.description(organisation.name)}>
      {requestCount > 0 && (
        <Notice tone="warning">
          {t.requests.pendingNotice(requestCount)}{" "}
          <Link href="/team/subscribers#requests" className="font-semibold text-brand underline underline-offset-4">
            {t.requests.review}
          </Link>
        </Notice>
      )}
      <SentNotesPrompt groups={awaitingDecision} />
      <FailurePanel failures={failures} />
      {failures.length === 0 && <Notice tone="success">{t.overview.allDelivered}</Notice>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile tone="brand" label={t.overview.members} value={String(members.length)} hint={t.overview.receiveEmail(optedIn)} />
        <StatTile
          tone="accent"
          label={t.overview.nextIssue}
          value={next?.scheduledAt ? formatDate(deliveryMomentFor(next.scheduledAt), locale) : "—"}
          hint={
            next
              ? `${t.schedule.between(DELIVERY_HOUR, DELIVERY_WINDOW_END_HOUR)} · ${newsletterDisplayTitle(next.title, t.newsletters.untitled)}`
              : t.overview.nothingScheduled
          }
        />
        <StatTile label={t.overview.drafts} value={String(drafts)} />
        <StatTile label={t.overview.openNotes} value={String(openNotes)} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/team/newsletters" className={buttonClasses("primary")}>
          {t.overview.uploadNewsletter}
        </Link>
        <Link href="/team/notes" className={buttonClasses("secondary")}>
          {t.overview.openNotesLink}
        </Link>
      </div>
      <ShareSubscribeCard
        url={organisationUrl(organisation.slug, "/")}
        slug={organisation.slug}
        organisationName={organisation.name}
        mode={organisation.subscriptionMode}
      />
    </TeamShell>
  );
};
