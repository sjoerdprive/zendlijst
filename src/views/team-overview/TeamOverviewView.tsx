import Link from "next/link";
import { listUnresolvedFailures } from "@/entities/delivery/server";
import { listMembers } from "@/entities/membership/server";
import { getNextScheduledNewsletter, listAllNewsletters } from "@/entities/newsletter/server";
import { listNotes } from "@/entities/note/server";
import { FailurePanel } from "@/features/delivery-failures";
import { getDictionary, getLocale } from "@/shared/i18n/server";
import { formatDateTime } from "@/shared/lib";
import { buttonClasses, Notice } from "@/shared/ui";
import { TeamShell } from "@/widgets/team-shell";
import { requireTeamAccess } from "@/widgets/team-shell/server";
import { StatTile } from "./StatTile";

export const TeamOverviewView = async () => {
  const { organisation, role } = await requireTeamAccess();
  const [failures, members, next, newsletters, notes, t, locale] = await Promise.all([
    listUnresolvedFailures(organisation.id),
    listMembers(organisation.id, ["admin", "writer", "subscriber"]),
    getNextScheduledNewsletter(organisation.id),
    listAllNewsletters(organisation.id),
    listNotes(organisation.id),
    getDictionary(),
    getLocale(),
  ]);
  const optedIn = members.filter((member) => member.emailNotifications).length;
  const drafts = newsletters.filter((newsletter) => newsletter.status === "draft").length;
  const openNotes = notes.filter((note) => !note.done).length;

  return (
    <TeamShell role={role} title={t.overview.title} description={t.overview.description(organisation.name)}>
      <FailurePanel failures={failures} />
      {failures.length === 0 && <Notice tone="success">{t.overview.allDelivered}</Notice>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile tone="brand" label={t.overview.members} value={String(members.length)} hint={t.overview.receiveEmail(optedIn)} />
        <StatTile
          tone="accent"
          label={t.overview.nextIssue}
          value={next?.scheduledAt ? formatDateTime(next.scheduledAt, locale) : "—"}
          hint={next?.title ?? t.overview.nothingScheduled}
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
    </TeamShell>
  );
};
