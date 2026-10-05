import { NoteItem } from "@/entities/note";
import { getDictionary } from "@/shared/i18n/server";
import type { NewsletterNotesPanelProps } from "../types";
import { NoteActions } from "./NoteActions";
import { QuickNoteForm } from "./QuickNoteForm";

// Notes shown next to the editor: open ones first, finished ones folded away.
export const NewsletterNotesPanel = async ({ newsletterId, notes, canAdd }: NewsletterNotesPanelProps) => {
  const t = await getDictionary();
  const open = notes.filter((note) => !note.done);
  const done = notes.filter((note) => note.done);
  return (
    <div className="space-y-4">
      {canAdd && <QuickNoteForm newsletterId={newsletterId} />}
      {open.length === 0 && done.length === 0 ? (
        <p className="text-sm text-muted">{t.notes.panelEmpty}</p>
      ) : (
        <ul className="divide-y divide-line">
          {open.map((note) => (
            <NoteItem key={note.id} note={note} showNewsletter={false} stacked actions={canAdd && <NoteActions note={note} />} />
          ))}
        </ul>
      )}
      {done.length > 0 && (
        <details className="rounded-xl border border-line px-3 py-2">
          <summary className="cursor-pointer text-sm font-semibold text-muted">{t.notes.doneCount(done.length)}</summary>
          <ul className="divide-y divide-line">
            {done.map((note) => (
              <NoteItem key={note.id} note={note} showNewsletter={false} stacked actions={canAdd && <NoteActions note={note} />} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
};
