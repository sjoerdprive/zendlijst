"use client";

import { useActionState } from "react";
import { SUBSCRIPTION_MODES } from "@/entities/organisation";
import { useDictionary } from "@/shared/i18n";
import { IDLE_STATE } from "@/shared/lib";
import { FormMessage, SubmitButton } from "@/shared/ui";
import { updateSubscriptionModeAction } from "../actions";
import type { SubscriptionModeFormProps } from "../types";

export const SubscriptionModeForm = ({ mode }: SubscriptionModeFormProps) => {
  const t = useDictionary();
  const [state, formAction] = useActionState(updateSubscriptionModeAction, IDLE_STATE);
  return (
    <form action={formAction} className="space-y-4">
      <fieldset className="space-y-2">
        <legend className="sr-only">{t.organisationSettings.modeTitle}</legend>
        {SUBSCRIPTION_MODES.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-line-strong bg-surface p-4 transition-colors has-checked:border-brand has-checked:bg-brand-soft"
          >
            <input
              type="radio"
              name="subscriptionMode"
              value={option}
              defaultChecked={option === mode}
              className="mt-1 accent-brand"
            />
            <span>
              <span className="block text-sm font-semibold">{t.organisationSettings.modes[option].label}</span>
              <span className="block text-sm text-muted">{t.organisationSettings.modes[option].description}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <FormMessage state={state} />
      <SubmitButton pendingLabel={t.common.saving}>{t.organisationSettings.save}</SubmitButton>
    </form>
  );
};
