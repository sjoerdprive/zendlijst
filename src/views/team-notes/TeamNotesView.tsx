import { isEditable } from "@/entities/newsletter";
import { listAllNewsletters } from "@/entities/newsletter/server";
import { listNotes } from "@/entities/note/server";
import { NoteBoard } from "@/features/newsletter-notes";
import { getDictionary } from "@/shared/i18n/server";
import { Card } from "@/shared/ui";
import { TeamShell } from "@/widgets/team-shell";
import { requireTeamAccess } from "@/widgets/team-shell/server";

export const TeamNotesView = async () => {
  const { organisation, role } = await requireTeamAccess();
  const [notes, newsletters, t] = await Promise.all([
    listNotes(organisation.id),
    listAllNewsletters(organisation.id),
    getDictionary(),
  ]);
  return (
    <TeamShell role={role} title={t.notes.title} description={t.notes.description}>
      <Card>
        <NoteBoard notes={notes} newsletters={newsletters.filter((newsletter) => isEditable(newsletter.status))} />
      </Card>
    </TeamShell>
  );
};
