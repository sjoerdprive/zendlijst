import { isEditable } from "@/entities/newsletter";
import { listAllNewsletters } from "@/entities/newsletter/server";
import { listNotes } from "@/entities/note/server";
import { NoteBoard } from "@/features/newsletter-notes";
import { Card } from "@/shared/ui";
import { TeamShell } from "@/widgets/team-shell";
import { requireTeamAccess } from "@/widgets/team-shell/server";

export const TeamNotesView = async () => {
  const { organisation, role } = await requireTeamAccess();
  const [notes, newsletters] = await Promise.all([
    listNotes(organisation.id),
    listAllNewsletters(organisation.id),
  ]);
  return (
    <TeamShell role={role} title="Notes" description="Shared notes for admins and writers, visible only to the team.">
      <Card>
        <NoteBoard notes={notes} newsletters={newsletters.filter((newsletter) => isEditable(newsletter.status))} />
      </Card>
    </TeamShell>
  );
};
