"use client";

import { useActionState } from "react";
import { useDictionary } from "@/shared/i18n";
import { IDLE_STATE } from "@/shared/lib";
import { Field, FormMessage, Input, SubmitButton } from "@/shared/ui";
import { signInAction } from "../actions";

export const SignInForm = () => {
  const t = useDictionary();
  const [state, formAction] = useActionState(signInAction, IDLE_STATE);
  return (
    <form action={formAction} className="space-y-4">
      <Field label={t.common.emailLabel} name="email">
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder={t.common.emailPlaceholder} />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pendingLabel={t.signIn.pending} className="w-full">
        {t.signIn.submit}
      </SubmitButton>
    </form>
  );
};
