"use client";

import { useActionState } from "react";
import { IDLE_STATE } from "@/shared/lib";
import { FormMessage, SubmitButton } from "@/shared/ui";
import { updateNotificationsAction } from "../actions";
import type { NotificationToggleProps } from "../types";

export const NotificationToggle = ({ enabled }: NotificationToggleProps) => {
  const [state, formAction] = useActionState(updateNotificationsAction, IDLE_STATE);
  return (
    <form action={formAction} className="space-y-4">
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="emailNotifications"
          defaultChecked={enabled}
          className="mt-0.5 size-4 rounded border-zinc-300"
        />
        <span>
          <span className="font-medium">Email me new issues</span>
          <span className="block text-zinc-500">When a newsletter is published, you receive it in your inbox.</span>
        </span>
      </label>
      <FormMessage state={state} />
      <SubmitButton variant="secondary" pendingLabel="Saving…">
        Save preference
      </SubmitButton>
    </form>
  );
};
