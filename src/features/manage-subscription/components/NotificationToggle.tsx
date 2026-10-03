"use client";

import { useActionState } from "react";
import { useDictionary } from "@/shared/i18n";
import { IDLE_STATE } from "@/shared/lib";
import { FormMessage, SubmitButton } from "@/shared/ui";
import { updateNotificationsAction } from "../actions";
import type { NotificationToggleProps } from "../types";

export const NotificationToggle = ({ enabled }: NotificationToggleProps) => {
  const t = useDictionary();
  const [state, formAction] = useActionState(updateNotificationsAction, IDLE_STATE);
  return (
    <form action={formAction} className="space-y-4">
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="emailNotifications"
          defaultChecked={enabled}
          className="mt-0.5 size-4 rounded accent-brand"
        />
        <span>
          <span className="font-semibold">{t.settings.notifyLabel}</span>
          <span className="block text-muted">{t.settings.notifyHint}</span>
        </span>
      </label>
      <FormMessage state={state} />
      <SubmitButton variant="secondary" pendingLabel={t.common.saving}>
        {t.settings.savePreference}
      </SubmitButton>
    </form>
  );
};
