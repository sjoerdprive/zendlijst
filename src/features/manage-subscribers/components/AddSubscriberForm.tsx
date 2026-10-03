"use client";

import { useActionState } from "react";
import { IDLE_STATE } from "@/shared/lib";
import { FormMessage, Input, SubmitButton } from "@/shared/ui";
import { addSubscriberAction } from "../actions";

export const AddSubscriberForm = () => {
  const [state, formAction] = useActionState(addSubscriberAction, IDLE_STATE);
  return (
    <form action={formAction} className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="new-subscriber" className="sr-only">
          Email address
        </label>
        <Input id="new-subscriber" name="email" type="email" required placeholder="subscriber@example.com" />
        <SubmitButton pendingLabel="Adding…" className="shrink-0">
          Add subscriber
        </SubmitButton>
      </div>
      <p className="text-xs text-zinc-500">
        Only add people who asked to receive your newsletter. They can unsubscribe from any email.
      </p>
      <FormMessage state={state} />
    </form>
  );
};
