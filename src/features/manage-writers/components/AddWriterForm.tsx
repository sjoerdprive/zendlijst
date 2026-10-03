"use client";

import { useActionState } from "react";
import { MAX_WRITERS } from "@/entities/membership";
import { IDLE_STATE } from "@/shared/lib";
import { FormMessage, Input, SubmitButton } from "@/shared/ui";
import { addWriterAction } from "../actions";
import type { AddWriterFormProps } from "../types";

// Stays mounted at the writer limit so the last success message remains visible.
export const AddWriterForm = ({ limitReached }: AddWriterFormProps) => {
  const [state, formAction] = useActionState(addWriterAction, IDLE_STATE);
  return (
    <form action={formAction} className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="new-writer" className="sr-only">
          Writer email address
        </label>
        <Input
          id="new-writer"
          name="email"
          type="email"
          required
          disabled={limitReached}
          placeholder="writer@example.com"
        />
        <SubmitButton pendingLabel="Adding…" className="shrink-0" disabled={limitReached}>
          Add writer
        </SubmitButton>
      </div>
      {limitReached && (
        <p className="text-sm text-zinc-500">
          You have reached the maximum of {MAX_WRITERS} writers. Remove one to add someone else.
        </p>
      )}
      <FormMessage state={state} />
    </form>
  );
};
