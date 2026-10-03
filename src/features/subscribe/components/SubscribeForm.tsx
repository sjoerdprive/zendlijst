"use client";

import { useActionState } from "react";
import { IDLE_STATE } from "@/shared/lib";
import { Field, FormMessage, Input, SubmitButton } from "@/shared/ui";
import { subscribeAction } from "../actions";

export const SubscribeForm = () => {
  const [state, formAction] = useActionState(subscribeAction, IDLE_STATE);
  const errors = state.status === "error" ? state.fieldErrors : undefined;

  if (state.status === "success") {
    return <FormMessage state={state} />;
  }

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Email address" name="email" errors={errors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </Field>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="notify" defaultChecked className="mt-0.5 size-4 rounded border-zinc-300" />
        <span>Email me each new issue when it is published</span>
      </label>
      <FormMessage state={state} />
      <SubmitButton pendingLabel="Sending…" className="w-full">
        Subscribe
      </SubmitButton>
      <p className="text-xs text-zinc-500">
        We will email you a link to confirm your address. Your email is stored encrypted and only used for this newsletter.
      </p>
    </form>
  );
};
