"use client";

import { useActionState, useEffect, useRef } from "react";
import { useDictionary } from "@/shared/i18n";
import { IDLE_STATE } from "@/shared/lib";
import { Field, FormMessage, Input, SubmitButton } from "@/shared/ui";
import { signInAction } from "../actions";
import type { SignInEmailFormProps } from "../types";

export const SignInEmailForm = ({ onSent }: SignInEmailFormProps) => {
  const t = useDictionary();
  const [state, formAction] = useActionState(signInAction, IDLE_STATE);
  const submittedEmail = useRef("");

  useEffect(() => {
    if (state.status === "success") onSent(submittedEmail.current);
  }, [state, onSent]);

  return (
    <form
      action={(formData) => {
        submittedEmail.current = String(formData.get("email") ?? "").trim();
        formAction(formData);
      }}
      className="space-y-4"
    >
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
