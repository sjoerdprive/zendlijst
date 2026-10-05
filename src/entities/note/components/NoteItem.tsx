"use client";

import { useDictionary, useLocale } from "@/shared/i18n";
import { cn, formatDateTime } from "@/shared/lib";
import type { NoteItemProps } from "../types";

export const NoteItem = ({ note, actions, showNewsletter = true, stacked = false }: NoteItemProps) => {
  const t = useDictionary();
  const locale = useLocale();
  return (
    <li className={cn("flex items-start justify-between gap-4 py-4", stacked && "flex-col gap-2")}>
      <div className="flex min-w-0 gap-3">
        <span aria-hidden="true" className={cn("mt-1.5 size-2 shrink-0 rounded-full", note.done ? "bg-line-strong" : "bg-accent")} />
        <div className="min-w-0">
          <p className={cn("whitespace-pre-wrap text-sm", note.done && "text-muted line-through")}>{note.body}</p>
          <p className="mt-1 text-xs text-muted">
            {note.authorEmail ?? t.notes.formerMember} · {formatDateTime(note.createdAt, locale)}
            {showNewsletter && note.newsletterId && (
              <> · {t.notes.forNewsletter(note.newsletterTitle?.trim() || t.newsletters.untitled)}</>
            )}
            {showNewsletter && note.forNextDraft && <> · {t.notes.waitingForDraft}</>}
          </p>
        </div>
      </div>
      {actions && <div className={cn("flex shrink-0 flex-wrap gap-1", stacked && "-ml-2 pl-5")}>{actions}</div>}
    </li>
  );
};
