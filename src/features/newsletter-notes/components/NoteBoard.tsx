import { NoteItem } from "@/entities/note";
import { getDictionary } from "@/shared/i18n/server";
import { EmptyState } from "@/shared/ui";
import type { NoteBoardProps } from "../types";
import { NoteActions } from "./NoteActions";
import { NoteForm } from "./NoteForm";

export const NoteBoard = async ({ notes, newsletters }: NoteBoardProps) => {
  const t = await getDictionary();
  return (
    <div className="space-y-6">
      <NoteForm newsletters={newsletters} />
      {notes.length === 0 ? (
        <EmptyState title={t.notes.emptyTitle}>{t.notes.emptyBody}</EmptyState>
      ) : (
        <ul className="divide-y divide-line">
          {notes.map((note) => (
            <NoteItem key={note.id} note={note} actions={<NoteActions note={note} />} />
          ))}
        </ul>
      )}
    </div>
  );
};
