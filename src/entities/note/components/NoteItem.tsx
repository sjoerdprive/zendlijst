import { cn, formatDateTime } from "@/shared/lib";
import type { NoteItemProps } from "../types";

export const NoteItem = ({ note, actions }: NoteItemProps) => (
  <li className="flex items-start justify-between gap-4 py-4">
    <div className="min-w-0">
      <p className={cn("whitespace-pre-wrap text-sm", note.done && "text-zinc-400 line-through")}>{note.body}</p>
      <p className="mt-1 text-xs text-zinc-500">
        {note.authorEmail ?? "Former team member"} · {formatDateTime(note.createdAt)}
        {note.newsletterTitle && <> · for “{note.newsletterTitle}”</>}
      </p>
    </div>
    {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
  </li>
);
