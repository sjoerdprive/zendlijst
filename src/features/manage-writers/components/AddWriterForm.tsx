"use client";

import { useActionState } from "react";
import { MAX_WRITERS } from "@/entities/membership";
import { useDictionary } from "@/shared/i18n";
import { IDLE_STATE } from "@/shared/lib";
import { FormMessage, Input, SubmitButton } from "@/shared/ui";
import { addWriterAction } from "../actions";
import type { AddWriterFormProps } from "../types";

// Stays mounted at the writer limit so the last success message remains visible.
export const AddWriterForm = ({ limitReached }: AddWriterFormProps) => {
  const t = useDictionary();
  const [state, formAction] = useActionState(addWriterAction, IDLE_STATE);
  return (
    <form action={formAction} className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="new-writer" className="sr-only">
          {t.writers.emailLabel}
        </label>
        <Input
          id="new-writer"
          name="email"
          type="email"
          required
          disabled={limitReached}
          placeholder={t.writers.placeholder}
        />
        <SubmitButton pendingLabel={t.common.adding} className="shrink-0" disabled={limitReached}>
          {t.writers.add}
        </SubmitButton>
      </div>
      {limitReached && (
        <p className="text-sm text-muted">{t.writers.limitReached(MAX_WRITERS)}</p>
      )}
      <FormMessage state={state} />
    </form>
  );
};
