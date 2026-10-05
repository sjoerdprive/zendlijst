"use client";

import { useActionState } from "react";
import {
  DELIVERY_HOUR,
  DELIVERY_WINDOW_END_HOUR,
  deliveryMomentFor,
  describeDelivery,
  newsletterDisplayTitle,
  toAppDateString,
} from "@/entities/newsletter";
import { useDictionary, useLocale } from "@/shared/i18n";
import { IDLE_STATE, useFullPageRedirect } from "@/shared/lib";
import { Field, FormMessage, Input, SubmitButton } from "@/shared/ui";
import { sendNewsletterAction } from "../actions";
import { useGuardedSubmit } from "../lib/useGuardedSubmit";
import type { SendPanelProps } from "../types";

export const SendPanel = ({ newsletterId, title, status, scheduledAt, earliestDate, flush, discard }: SendPanelProps) => {
  const t = useDictionary();
  const locale = useLocale();
  const [state, formAction] = useActionState(sendNewsletterAction, IDLE_STATE);
  useFullPageRedirect(state);
  const isScheduled = status === "scheduled" && scheduledAt;
  const currentDate = isScheduled ? toAppDateString(deliveryMomentFor(scheduledAt)) : earliestDate;

  const onSubmit = useGuardedSubmit(
    async (submitter) => {
      const intent = submitter?.value;
      if (intent === "delete") {
        discard();
        return true;
      }
      // Moving back to drafts needs no save; scheduling sends what is saved.
      return intent === "unschedule" ? true : flush();
    },
    (submitter) => {
      if (submitter?.value === "now") return t.editor.confirmSendNow;
      if (submitter?.value === "delete") return t.newsletters.confirmDelete(newsletterDisplayTitle(title, t.newsletters.untitled));
      return null;
    },
  );
  const errors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="newsletterId" value={newsletterId} />
      {isScheduled ? (
        <p className="rounded-xl bg-brand-soft px-3 py-2 text-sm font-semibold text-brand">
          {t.editor.scheduledFor(describeDelivery(scheduledAt, t, locale))}
        </p>
      ) : (
        <p className="text-sm text-muted">{t.editor.sendHint}</p>
      )}
      <Field
        label={t.newsletters.publishAt}
        name="scheduledDate"
        hint={t.schedule.explanation(DELIVERY_HOUR, DELIVERY_WINDOW_END_HOUR)}
        errors={errors?.scheduledDate}
      >
        <Input
          id="scheduledDate"
          name="scheduledDate"
          type="date"
          min={earliestDate}
          defaultValue={currentDate}
          className="sm:w-56"
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        <SubmitButton name="intent" value="schedule">
          {isScheduled ? t.editor.reschedule : t.editor.schedule}
        </SubmitButton>
        <SubmitButton name="intent" value="now" variant="secondary">
          {t.editor.sendNow}
        </SubmitButton>
        {isScheduled && (
          <SubmitButton name="intent" value="unschedule" variant="ghost">
            {t.editor.unschedule}
          </SubmitButton>
        )}
        <SubmitButton name="intent" value="delete" variant="dangerGhost">
          {isScheduled ? t.editor.deleteScheduled : t.editor.deleteDraft}
        </SubmitButton>
      </div>
      <FormMessage state={state} />
    </form>
  );
};
