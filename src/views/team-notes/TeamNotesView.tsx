import Link from "next/link";
import { isEditable } from "@/entities/newsletter";
import { listAllNewsletters } from "@/entities/newsletter/server";
import { listNotes, listNotesAwaitingDecision } from "@/entities/note/server";
import { ArchivedNoteList, NoteBoard, SentNotesPrompt } from "@/features/newsletter-notes";
import { getDictionary } from "@/shared/i18n/server";
import { buttonClasses, Card } from "@/shared/ui";
import { TeamShell } from "@/widgets/team-shell";
import { requireTeamAccess } from "@/widgets/team-shell/server";
import type { TeamNotesViewProps } from "./types";

export const TeamNotesView = async ({ showArchive }: TeamNotesViewProps) => {
  const { organisation, role } = await requireTeamAccess();
  const t = await getDictionary();

  if (showArchive) {
    const archived = await listNotes(organisation.id, { archived: true });
    return (
      <TeamShell role={role} title={t.notes.archiveTitle} description={t.notes.description}>
        <Link href="/team/notes" className={buttonClasses("secondary", "self-start")}>
          {t.notes.hideArchive}
        </Link>
        <Card>
          <ArchivedNoteList notes={archived} />
        </Card>
      </TeamShell>
    );
  }

  const [notes, newsletters, awaitingDecision] = await Promise.all([
    listNotes(organisation.id),
    listAllNewsletters(organisation.id),
    listNotesAwaitingDecision(organisation.id),
  ]);
  // Notes of sent issues are handled by the decision cards above the board.
  const sentIds = new Set(awaitingDecision.map((group) => group.newsletterId));
  return (
    <TeamShell role={role} title={t.notes.title} description={t.notes.description}>
      <SentNotesPrompt groups={awaitingDecision} />
      <Card
        actions={
          <Link href="/team/notes?view=archive" className={buttonClasses("ghost")}>
            {t.notes.showArchive}
          </Link>
        }
        title={t.notes.title}
      >
        <NoteBoard
          notes={notes.filter((note) => !note.newsletterId || !sentIds.has(note.newsletterId))}
          newsletters={newsletters.filter((newsletter) => isEditable(newsletter.status))}
        />
      </Card>
    </TeamShell>
  );
};
