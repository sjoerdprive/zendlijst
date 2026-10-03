"use client";

import { useActionState } from "react";
import { IDLE_STATE } from "@/shared/lib";
import { SubmitButton } from "@/shared/ui";
import { removeSubscriberAction } from "../actions";
import type { RemoveSubscriberButtonProps } from "../types";

export const RemoveSubscriberButton = ({ membershipId, email }: RemoveSubscriberButtonProps) => {
  const [state, formAction] = useActionState(removeSubscriberAction, IDLE_STATE);
  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(`Remove ${email} from the subscriber list?`)) event.preventDefault();
      }}
    >
      <input type="hidden" name="membershipId" value={membershipId} />
      <SubmitButton variant="ghost" className="text-red-600" pendingLabel="Removing…">
        Remove
      </SubmitButton>
      {state.status === "error" && <p className="text-xs text-red-600">{state.message}</p>}
    </form>
  );
};
