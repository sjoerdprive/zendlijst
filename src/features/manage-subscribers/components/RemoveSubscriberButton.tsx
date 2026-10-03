"use client";

import { useActionState } from "react";
import { useDictionary } from "@/shared/i18n";
import { IDLE_STATE } from "@/shared/lib";
import { SubmitButton } from "@/shared/ui";
import { removeSubscriberAction } from "../actions";
import type { RemoveSubscriberButtonProps } from "../types";

export const RemoveSubscriberButton = ({ membershipId, email }: RemoveSubscriberButtonProps) => {
  const t = useDictionary();
  const [state, formAction] = useActionState(removeSubscriberAction, IDLE_STATE);
  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(t.subscribers.confirmRemove(email))) event.preventDefault();
      }}
    >
      <input type="hidden" name="membershipId" value={membershipId} />
      <SubmitButton variant="dangerGhost" pendingLabel={t.common.removing}>
        {t.common.remove}
      </SubmitButton>
      {state.status === "error" && <p className="text-xs text-danger">{state.message}</p>}
    </form>
  );
};
