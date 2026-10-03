import { NoteItem } from "@/entities/note";
import { EmptyState } from "@/shared/ui";
import type { NoteBoardProps } from "../types";
import { NoteActions } from "./NoteActions";
import { NoteForm } from "./NoteForm";

export const NoteBoard = ({ notes, newsletters }: NoteBoardProps) => (
  <div className="space-y-6">
    <NoteForm newsletters={newsletters} />
    {notes.length === 0 ? (
      <EmptyState title="No notes yet.">Keep track of ideas and to-dos leading up to the next issue.</EmptyState>
    ) : (
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {notes.map((note) => (
          <NoteItem key={note.id} note={note} actions={<NoteActions note={note} />} />
        ))}
      </ul>
    )}
  </div>
);
