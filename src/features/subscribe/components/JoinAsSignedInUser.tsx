import { getDictionary } from "@/shared/i18n/server";
import { SubmitButton } from "@/shared/ui";
import { subscribeSignedInAction } from "../actions";

export const JoinAsSignedInUser = async () => {
  const t = await getDictionary();
  return (
    <form action={subscribeSignedInAction} className="space-y-4">
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="notify" defaultChecked className="mt-0.5 size-4 rounded accent-brand" />
        <span>{t.subscribe.notifyLabel}</span>
      </label>
      <SubmitButton pendingLabel={t.subscribe.joinPending}>{t.subscribe.submit}</SubmitButton>
    </form>
  );
};
