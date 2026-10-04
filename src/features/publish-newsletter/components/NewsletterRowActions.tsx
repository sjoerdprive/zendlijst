"use client";

import { useActionState, useState } from "react";
import { deliveryMomentFor, isEditable, toAppDateString } from "@/entities/newsletter";
import { useDictionary } from "@/shared/i18n";
import { cn, IDLE_STATE } from "@/shared/lib";
import { Button, Input, SubmitButton } from "@/shared/ui";
import { deleteNewsletterAction, rescheduleNewsletterAction } from "../actions";
import type { NewsletterRowActionsProps } from "../types";

export const NewsletterRowActions = ({ newsletter, earliestDate }: NewsletterRowActionsProps) => {
  const t = useDictionary();
  const [rescheduleState, rescheduleAction] = useActionState(rescheduleNewsletterAction, IDLE_STATE);
  const [deleteState, deleteAction] = useActionState(deleteNewsletterAction, IDLE_STATE);
  const [editing, setEditing] = useState(false);

  if (!isEditable(newsletter.status)) return null;
  const message = [deleteState, rescheduleState].find(
    (state) => state.status === "success" || state.status === "error",
  );
  const currentDate = newsletter.scheduledAt ? toAppDateString(deliveryMomentFor(newsletter.scheduledAt)) : "";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap justify-end gap-1">
        <Button variant="ghost" onClick={() => setEditing((value) => !value)}>
          {editing ? t.common.cancel : t.newsletters.reschedule}
        </Button>
        <form
          action={deleteAction}
          onSubmit={(event) => {
            if (!window.confirm(t.newsletters.confirmDelete(newsletter.title))) event.preventDefault();
          }}
        >
          <input type="hidden" name="newsletterId" value={newsletter.id} />
          <SubmitButton variant="dangerGhost">{t.common.delete}</SubmitButton>
        </form>
      </div>
      {editing && (
        <form action={rescheduleAction} className="flex flex-wrap items-center justify-end gap-2">
          <input type="hidden" name="newsletterId" value={newsletter.id} />
          <label htmlFor={`reschedule-${newsletter.id}`} className="sr-only">
            {t.newsletters.newDate}
          </label>
          <div className="w-44">
            <Input
              id={`reschedule-${newsletter.id}`}
              name="scheduledDate"
              type="date"
              defaultValue={currentDate}
              min={earliestDate}
            />
          </div>
          <SubmitButton variant="secondary">{t.common.save}</SubmitButton>
        </form>
      )}
      {message ? (
        <p className={cn("text-right text-xs", message.status === "error" ? "text-danger" : "text-muted")}>
          {message.message}
        </p>
      ) : null}
    </div>
  );
};
