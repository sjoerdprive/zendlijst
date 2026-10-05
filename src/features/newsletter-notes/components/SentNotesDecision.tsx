"use client";

import { useActionState } from "react";
import { newsletterDisplayTitle } from "@/entities/newsletter";
import { NoteItem } from "@/entities/note";
import { useDictionary } from "@/shared/i18n";
import { IDLE_STATE } from "@/shared/lib";
import { FormMessage, SubmitButton } from "@/shared/ui";
import { decideNotesAction } from "../actions";
import type { SentNotesDecisionProps } from "../types";

// One sent issue: archive, delete or take along all of its notes, or decide per note.
export const SentNotesDecision = ({ group }: SentNotesDecisionProps) => {
  const t = useDictionary();
  const copy = t.notes.afterSend;
  const [state, formAction] = useActionState(decideNotesAction, IDLE_STATE);
  const confirmDelete = (event: React.FormEvent<HTMLFormElement>) => {
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (submitter?.value === "delete" && !window.confirm(copy.confirmDelete)) event.preventDefault();
  };

  return (
    <section className="rounded-2xl border border-accent/40 bg-accent-soft/50 p-5">
      <h3 className="font-display font-semibold">
        {copy.title(newsletterDisplayTitle(group.newsletterTitle, t.newsletters.untitled))}
      </h3>
      <p className="mt-1 text-sm text-muted">{copy.body(group.notes.length)}</p>
      <form action={formAction} onSubmit={confirmDelete} className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="newsletterId" value={group.newsletterId} />
        <SubmitButton name="decision" value="move">
          {copy.takeAlong}
        </SubmitButton>
        <SubmitButton name="decision" value="archive" variant="secondary">
          {copy.archive}
        </SubmitButton>
        <SubmitButton name="decision" value="delete" variant="dangerGhost">
          {copy.delete}
        </SubmitButton>
      </form>
      <p className="mt-2 text-xs text-muted">{copy.takeAlongHint}</p>
      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-semibold text-brand">{copy.perNote}</summary>
        <ul className="mt-2 divide-y divide-line">
          {group.notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              showNewsletter={false}
              stacked
              actions={
                <form action={formAction} className="flex flex-wrap gap-1">
                  <input type="hidden" name="newsletterId" value={group.newsletterId} />
                  <input type="hidden" name="noteId" value={note.id} />
                  <SubmitButton name="decision" value="move" variant="ghost">
                    {copy.takeAlongOne}
                  </SubmitButton>
                  <SubmitButton name="decision" value="archive" variant="ghost">
                    {copy.archive}
                  </SubmitButton>
                  <SubmitButton name="decision" value="delete" variant="dangerGhost">
                    {copy.delete}
                  </SubmitButton>
                </form>
              }
            />
          ))}
        </ul>
      </details>
      {state.status !== "idle" && (
        <div className="mt-3">
          <FormMessage state={state} />
        </div>
      )}
    </section>
  );
};
