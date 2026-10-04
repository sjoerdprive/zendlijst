"use client";

import { useActionState } from "react";
import { useDictionary } from "@/shared/i18n";
import { IDLE_STATE, useFullPageRedirect } from "@/shared/lib";
import { Button, CodeInput, Field, FormMessage, Notice, SubmitButton } from "@/shared/ui";
import { verifySignInCodeAction } from "../actions";
import type { SignInCodeFormProps } from "../types";

export const SignInCodeForm = ({ email, onBack }: SignInCodeFormProps) => {
  const t = useDictionary();
  const [state, formAction] = useActionState(verifySignInCodeAction, IDLE_STATE);
  useFullPageRedirect(state);
  return (
    <div className="space-y-4">
      <Notice tone="success">{t.signIn.checkInbox}</Notice>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="email" value={email} />
        <Field label={t.signIn.codeLabel} name="code" hint={t.signIn.codeHint}>
          <CodeInput id="code" name="code" required autoFocus placeholder="000000" />
        </Field>
        <FormMessage state={state} />
        <SubmitButton pendingLabel={t.signIn.codePending} className="w-full">
          {t.signIn.codeSubmit}
        </SubmitButton>
      </form>
      <Button variant="ghost" className="w-full" onClick={onBack}>
        {t.signIn.useOtherEmail}
      </Button>
    </div>
  );
};
