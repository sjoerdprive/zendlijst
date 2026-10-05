"use client";

import { useActionState } from "react";
import { useDictionary } from "@/shared/i18n";
import { IDLE_STATE } from "@/shared/lib";
import { FormMessage, SubmitButton, Textarea } from "@/shared/ui";
import { addNoteAction } from "../actions";
import type { QuickNoteFormProps } from "../types";

// Adds a note straight to the newsletter being edited.
export const QuickNoteForm = ({ newsletterId }: QuickNoteFormProps) => {
  const t = useDictionary();
  const [state, formAction] = useActionState(addNoteAction, IDLE_STATE);
  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="target" value={`newsletter:${newsletterId}`} />
      <label htmlFor="quick-note" className="sr-only">
        {t.notes.newNote}
      </label>
      <Textarea
        id="quick-note"
        name="body"
        required
        maxLength={2000}
        placeholder={t.notes.panelPlaceholder}
        className="min-h-16"
      />
      <div className="flex justify-end">
        <SubmitButton variant="secondary" pendingLabel={t.common.adding}>
          {t.notes.add}
        </SubmitButton>
      </div>
      {state.status === "error" && <FormMessage state={state} />}
    </form>
  );
};
