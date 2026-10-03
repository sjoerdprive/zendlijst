"use client";

import { useActionState } from "react";
import { useDictionary } from "@/shared/i18n";
import { IDLE_STATE } from "@/shared/lib";
import { SubmitButton } from "@/shared/ui";
import { removeWriterAction } from "../actions";
import type { RemoveWriterButtonProps } from "../types";

export const RemoveWriterButton = ({ membershipId }: RemoveWriterButtonProps) => {
  const t = useDictionary();
  const [state, formAction] = useActionState(removeWriterAction, IDLE_STATE);
  return (
    <form action={formAction}>
      <input type="hidden" name="membershipId" value={membershipId} />
      <SubmitButton variant="dangerGhost" pendingLabel={t.common.removing}>
        {t.common.remove}
      </SubmitButton>
      {state.status === "error" && <p className="text-xs text-danger">{state.message}</p>}
    </form>
  );
};
