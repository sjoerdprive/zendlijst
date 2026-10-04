"use client";

import { useDictionary } from "@/shared/i18n";
import { navigateTo } from "@/shared/lib";
import { SubmitButton } from "@/shared/ui";
import { subscribeSignedInAction } from "../actions";
import type { JoinAsSignedInUserProps } from "../types";

export const JoinAsSignedInUser = ({ requiresApproval }: JoinAsSignedInUserProps) => {
  const t = useDictionary();
  return (
    <form action={async (formData) => navigateTo(await subscribeSignedInAction(formData))} className="space-y-4">
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="notify" defaultChecked className="mt-0.5 size-4 rounded accent-brand" />
        <span>{t.subscribe.notifyLabel}</span>
      </label>
      <SubmitButton pendingLabel={t.subscribe.joinPending}>
        {requiresApproval ? t.subscribe.submitRequest : t.subscribe.submit}
      </SubmitButton>
    </form>
  );
};
