"use client";

import { useActionState } from "react";
import { IDLE_STATE } from "@/shared/lib";
import { SubmitButton } from "@/shared/ui";
import { removeWriterAction } from "../actions";
import type { RemoveWriterButtonProps } from "../types";

export const RemoveWriterButton = ({ membershipId }: RemoveWriterButtonProps) => {
  const [state, formAction] = useActionState(removeWriterAction, IDLE_STATE);
  return (
    <form action={formAction}>
      <input type="hidden" name="membershipId" value={membershipId} />
      <SubmitButton variant="ghost" className="text-red-600" pendingLabel="Removing…">
        Remove
      </SubmitButton>
      {state.status === "error" && <p className="text-xs text-red-600">{state.message}</p>}
    </form>
  );
};
