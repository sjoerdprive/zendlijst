"use client";

import { useActionState } from "react";
import { useDictionary } from "@/shared/i18n";
import { IDLE_STATE } from "@/shared/lib";
import { Field, FormMessage, Input, SubmitButton } from "@/shared/ui";
import { subscribeAction } from "../actions";
import type { SubscribeFormProps } from "../types";

export const SubscribeForm = ({ requiresApproval }: SubscribeFormProps) => {
  const t = useDictionary();
  const [state, formAction] = useActionState(subscribeAction, IDLE_STATE);
  const errors = state.status === "error" ? state.fieldErrors : undefined;

  if (state.status === "success") {
    return <FormMessage state={state} />;
  }

  return (
    <form action={formAction} className="space-y-4">
      <Field label={t.common.emailLabel} name="email" errors={errors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder={t.common.emailPlaceholder} />
      </Field>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="notify" defaultChecked className="mt-0.5 size-4 rounded accent-brand" />
        <span>{t.subscribe.notifyLabel}</span>
      </label>
      <FormMessage state={state} />
      <SubmitButton pendingLabel={t.subscribe.pending} className="w-full">
        {requiresApproval ? t.subscribe.submitRequest : t.subscribe.submit}
      </SubmitButton>
      <p className="text-xs text-muted">{t.subscribe.privacy}</p>
    </form>
  );
};
