"use client";

import { useActionState } from "react";
import { IDLE_STATE } from "@/shared/lib";
import { Field, FormMessage, Select, SubmitButton, Textarea } from "@/shared/ui";
import { addNoteAction } from "../actions";
import type { NoteFormProps } from "../types";

export const NoteForm = ({ newsletters }: NoteFormProps) => {
  const [state, formAction] = useActionState(addNoteAction, IDLE_STATE);
  return (
    // React resets the uncontrolled form after a successful action.
    <form action={formAction} className="space-y-3">
      <Field label="New note" name="body">
        <Textarea id="body" name="body" required maxLength={2000} placeholder="Ideas, reminders, to-dos for the next issue…" />
      </Field>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Field label="Related newsletter (optional)" name="newsletterId">
            <Select id="newsletterId" name="newsletterId" defaultValue="">
              <option value="">General</option>
              {newsletters.map((newsletter) => (
                <option key={newsletter.id} value={newsletter.id}>
                  {newsletter.title}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <SubmitButton pendingLabel="Adding…">Add note</SubmitButton>
      </div>
      {state.status === "error" && <FormMessage state={state} />}
    </form>
  );
};
