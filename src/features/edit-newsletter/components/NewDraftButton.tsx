"use client";

import { useActionState } from "react";
import { useDictionary } from "@/shared/i18n";
import { IDLE_STATE, useFullPageRedirect } from "@/shared/lib";
import { FormMessage, SubmitButton } from "@/shared/ui";
import { createDraftAction } from "../actions";

export const NewDraftButton = () => {
  const t = useDictionary();
  const [state, formAction] = useActionState(createDraftAction, IDLE_STATE);
  useFullPageRedirect(state);
  return (
    <form action={formAction}>
      <SubmitButton pendingLabel={t.newsletters.creatingDraft}>+ {t.newsletters.newDraft}</SubmitButton>
      {state.status === "error" && <FormMessage state={state} />}
    </form>
  );
};
