"use client";

import { useDictionary, useLocale } from "@/shared/i18n";
import { cn, formatDateTime } from "@/shared/lib";
import type { NoteItemProps } from "../types";

export const NoteItem = ({ note, actions }: NoteItemProps) => {
  const t = useDictionary();
  const locale = useLocale();
  return (
    <li className="flex items-start justify-between gap-4 py-4">
      <div className="flex min-w-0 gap-3">
        <span aria-hidden="true" className={cn("mt-1.5 size-2 shrink-0 rounded-full", note.done ? "bg-line-strong" : "bg-accent")} />
        <div className="min-w-0">
          <p className={cn("whitespace-pre-wrap text-sm", note.done && "text-muted line-through")}>{note.body}</p>
          <p className="mt-1 text-xs text-muted">
            {note.authorEmail ?? t.notes.formerMember} · {formatDateTime(note.createdAt, locale)}
            {note.newsletterTitle && <> · {t.notes.forNewsletter(note.newsletterTitle)}</>}
          </p>
        </div>
      </div>
      {actions && <div className="flex shrink-0 gap-1">{actions}</div>}
    </li>
  );
};
