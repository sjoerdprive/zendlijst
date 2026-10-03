"use client";

import { useActionState } from "react";
import { IDLE_STATE } from "@/shared/lib";
import { Field, FormMessage, Input, SubmitButton } from "@/shared/ui";
import { signInAction } from "../actions";

export const SignInForm = () => {
  const [state, formAction] = useActionState(signInAction, IDLE_STATE);
  return (
    <form action={formAction} className="space-y-4">
      <Field label="Email address" name="email">
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pendingLabel="Sending link…" className="w-full">
        Email me a sign-in link
      </SubmitButton>
    </form>
  );
};
