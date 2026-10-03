import { getDictionary } from "@/shared/i18n/server";
import { SubmitButton } from "@/shared/ui";
import { unsubscribeAction } from "../actions";

export const UnsubscribeButton = async () => {
  const t = await getDictionary();
  return (
    <form action={unsubscribeAction}>
      <SubmitButton variant="danger" pendingLabel={t.settings.unsubscribing}>
        {t.settings.unsubscribe}
      </SubmitButton>
    </form>
  );
};
