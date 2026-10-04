"use client";

import { useDictionary } from "@/shared/i18n";
import { navigateTo } from "@/shared/lib";
import { SubmitButton } from "@/shared/ui";
import { unsubscribeAction } from "../actions";

export const UnsubscribeButton = () => {
  const t = useDictionary();
  return (
    <form action={async () => navigateTo(await unsubscribeAction())}>
      <SubmitButton variant="danger" pendingLabel={t.settings.unsubscribing}>
        {t.settings.unsubscribe}
      </SubmitButton>
    </form>
  );
};
