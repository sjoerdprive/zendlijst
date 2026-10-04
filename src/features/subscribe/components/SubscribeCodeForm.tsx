"use client";

import { useActionState } from "react";
import { useDictionary } from "@/shared/i18n";
import { IDLE_STATE, useFullPageRedirect } from "@/shared/lib";
import { Button, CodeInput, Field, FormMessage, Notice, SubmitButton } from "@/shared/ui";
import { subscribeWithCodeAction } from "../actions";
import type { SubscribeCodeFormProps } from "../types";

export const SubscribeCodeForm = ({ pending, message, onBack }: SubscribeCodeFormProps) => {
  const t = useDictionary();
  const [state, formAction] = useActionState(subscribeWithCodeAction, IDLE_STATE);
  useFullPageRedirect(state);
  return (
    <div className="space-y-4">
      <Notice tone="success">{message}</Notice>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="email" value={pending.email} />
        <input type="hidden" name="notify" value={pending.notify ? "1" : "0"} />
        <Field label={t.signIn.codeLabel} name="code" hint={t.signIn.codeHint}>
          <CodeInput id="code" name="code" required autoFocus placeholder="000000" />
        </Field>
        <FormMessage state={state} />
        <SubmitButton pendingLabel={t.signIn.codePending} className="w-full">
          {t.subscribe.codeSubmit}
        </SubmitButton>
      </form>
      <Button variant="ghost" className="w-full" onClick={onBack}>
        {t.signIn.useOtherEmail}
      </Button>
    </div>
  );
};
