"use client";

import { useActionState } from "react";
import { IDLE_STATE } from "@/shared/lib";
import { SubmitButton } from "@/shared/ui";
import { resolveFailureAction } from "../actions";
import type { ResolveButtonProps } from "../types";

export const ResolveButton = ({ deliveryIds, label }: ResolveButtonProps) => {
  const [state, formAction] = useActionState(resolveFailureAction, IDLE_STATE);
  return (
    <form action={formAction}>
      {deliveryIds.map((id) => (
        <input key={id} type="hidden" name="deliveryId" value={id} />
      ))}
      <SubmitButton variant="secondary" pendingLabel="Saving…">
        {label}
      </SubmitButton>
      {state.status === "error" && <p className="text-xs text-red-600">{state.message}</p>}
    </form>
  );
};
