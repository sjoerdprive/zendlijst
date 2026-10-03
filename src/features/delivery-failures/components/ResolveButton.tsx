"use client";

import { useActionState } from "react";
import { useDictionary } from "@/shared/i18n";
import { IDLE_STATE } from "@/shared/lib";
import { SubmitButton } from "@/shared/ui";
import { resolveFailureAction } from "../actions";
import type { ResolveButtonProps } from "../types";

export const ResolveButton = ({ deliveryIds, label }: ResolveButtonProps) => {
  const t = useDictionary();
  const [state, formAction] = useActionState(resolveFailureAction, IDLE_STATE);
  return (
    <form action={formAction}>
      {deliveryIds.map((id) => (
        <input key={id} type="hidden" name="deliveryId" value={id} />
      ))}
      <SubmitButton variant="secondary" pendingLabel={t.common.saving}>
        {label}
      </SubmitButton>
      {state.status === "error" && <p className="text-xs text-danger">{state.message}</p>}
    </form>
  );
};
