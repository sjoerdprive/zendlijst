import { NoteItem } from "@/entities/note";
import { getDictionary } from "@/shared/i18n/server";
import { EmptyState } from "@/shared/ui";
import type { ArchivedNoteListProps } from "../types";
import { NoteActions } from "./NoteActions";

export const ArchivedNoteList = async ({ notes }: ArchivedNoteListProps) => {
  const t = await getDictionary();
  if (notes.length === 0) return <EmptyState title={t.notes.archiveEmpty} />;
  return (
    <ul className="divide-y divide-line">
      {notes.map((note) => (
        <NoteItem key={note.id} note={note} actions={<NoteActions note={note} />} />
      ))}
    </ul>
  );
};
