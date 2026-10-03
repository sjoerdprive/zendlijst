import { Button } from "@/shared/ui";
import { deleteNoteAction, toggleNoteAction } from "../actions";
import type { NoteActionsProps } from "../types";

export const NoteActions = ({ note }: NoteActionsProps) => (
  <>
    <form action={toggleNoteAction}>
      <input type="hidden" name="noteId" value={note.id} />
      <input type="hidden" name="done" value={String(!note.done)} />
      <Button type="submit" variant="ghost">
        {note.done ? "Reopen" : "Done"}
      </Button>
    </form>
    <form action={deleteNoteAction}>
      <input type="hidden" name="noteId" value={note.id} />
      <Button type="submit" variant="ghost" className="text-red-600">
        Delete
      </Button>
    </form>
  </>
);
