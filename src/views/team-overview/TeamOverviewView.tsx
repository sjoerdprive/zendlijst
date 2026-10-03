import Link from "next/link";
import { listUnresolvedFailures } from "@/entities/delivery/server";
import { listMembers } from "@/entities/membership/server";
import { getNextScheduledNewsletter, listAllNewsletters } from "@/entities/newsletter/server";
import { listNotes } from "@/entities/note/server";
import { FailurePanel } from "@/features/delivery-failures";
import { formatDateTime } from "@/shared/lib";
import { buttonClasses, Notice } from "@/shared/ui";
import { TeamShell } from "@/widgets/team-shell";
import { requireTeamAccess } from "@/widgets/team-shell/server";
import { StatTile } from "./StatTile";

export const TeamOverviewView = async () => {
  const { organisation, role } = await requireTeamAccess();
  const [failures, members, next, newsletters, notes] = await Promise.all([
    listUnresolvedFailures(organisation.id),
    listMembers(organisation.id, ["admin", "writer", "subscriber"]),
    getNextScheduledNewsletter(organisation.id),
    listAllNewsletters(organisation.id),
    listNotes(organisation.id),
  ]);
  const optedIn = members.filter((member) => member.emailNotifications).length;
  const drafts = newsletters.filter((newsletter) => newsletter.status === "draft").length;
  const openNotes = notes.filter((note) => !note.done).length;

  return (
    <TeamShell role={role} title="Overview" description={`Everything happening at ${organisation.name}.`}>
      <FailurePanel failures={failures} />
      {failures.length === 0 && <Notice tone="success">All newsletter emails were delivered.</Notice>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Members" value={String(members.length)} hint={`${optedIn} receive email`} />
        <StatTile
          label="Next issue"
          value={next?.scheduledAt ? formatDateTime(next.scheduledAt) : "—"}
          hint={next?.title ?? "Nothing scheduled"}
        />
        <StatTile label="Drafts" value={String(drafts)} />
        <StatTile label="Open notes" value={String(openNotes)} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/team/newsletters" className={buttonClasses("primary")}>
          Upload a newsletter
        </Link>
        <Link href="/team/notes" className={buttonClasses("secondary")}>
          Open notes
        </Link>
      </div>
    </TeamShell>
  );
};
