import { getDictionary } from "@/shared/i18n/server";
import { Button } from "@/shared/ui";
import { archiveNoteAction, deleteNoteAction, restoreNoteAction, toggleNoteAction } from "../actions";
import type { NoteActionsProps } from "../types";

export const NoteActions = async ({ note }: NoteActionsProps) => {
  const t = await getDictionary();
  if (note.archivedAt) {
    return (
      <>
        <form action={restoreNoteAction}>
          <input type="hidden" name="noteId" value={note.id} />
          <Button type="submit" variant="ghost">
            {t.notes.restore}
          </Button>
        </form>
        <form action={deleteNoteAction}>
          <input type="hidden" name="noteId" value={note.id} />
          <Button type="submit" variant="dangerGhost">
            {t.common.delete}
          </Button>
        </form>
      </>
    );
  }
  return (
    <>
      <form action={toggleNoteAction}>
        <input type="hidden" name="noteId" value={note.id} />
        <input type="hidden" name="done" value={String(!note.done)} />
        <Button type="submit" variant="ghost">
          {note.done ? t.notes.reopen : t.notes.done}
        </Button>
      </form>
      <form action={archiveNoteAction}>
        <input type="hidden" name="noteId" value={note.id} />
        <Button type="submit" variant="ghost">
          {t.notes.archive}
        </Button>
      </form>
      <form action={deleteNoteAction}>
        <input type="hidden" name="noteId" value={note.id} />
        <Button type="submit" variant="dangerGhost">
          {t.common.delete}
        </Button>
      </form>
    </>
  );
};
