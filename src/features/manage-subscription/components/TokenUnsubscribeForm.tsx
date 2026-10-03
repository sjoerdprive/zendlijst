"use client";

import { useActionState } from "react";
import { IDLE_STATE } from "@/shared/lib";
import { FormMessage, SubmitButton } from "@/shared/ui";
import { unsubscribeWithTokenAction } from "../actions";
import type { TokenUnsubscribeFormProps } from "../types";

// A button (not an automatic GET) so mail scanners prefetching links cannot unsubscribe people.
export const TokenUnsubscribeForm = ({ token }: TokenUnsubscribeFormProps) => {
  const [state, formAction] = useActionState(unsubscribeWithTokenAction, IDLE_STATE);
  if (state.status === "success") return <FormMessage state={state} />;
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <FormMessage state={state} />
      <SubmitButton variant="danger" pendingLabel="Unsubscribing…">
        Confirm unsubscribe
      </SubmitButton>
    </form>
  );
};
