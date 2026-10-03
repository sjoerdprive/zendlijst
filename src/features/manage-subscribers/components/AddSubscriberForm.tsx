"use client";

import { useActionState } from "react";
import { useDictionary } from "@/shared/i18n";
import { IDLE_STATE } from "@/shared/lib";
import { FormMessage, Input, SubmitButton } from "@/shared/ui";
import { addSubscriberAction } from "../actions";

export const AddSubscriberForm = () => {
  const t = useDictionary();
  const [state, formAction] = useActionState(addSubscriberAction, IDLE_STATE);
  return (
    <form action={formAction} className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="new-subscriber" className="sr-only">
          {t.common.emailLabel}
        </label>
        <Input id="new-subscriber" name="email" type="email" required placeholder={t.subscribers.placeholder} />
        <SubmitButton pendingLabel={t.common.adding} className="shrink-0">
          {t.subscribers.add}
        </SubmitButton>
      </div>
      <p className="text-xs text-muted">{t.subscribers.consent}</p>
      <FormMessage state={state} />
    </form>
  );
};
