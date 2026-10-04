"use client";

import { useActionState } from "react";
import {
  ACCEPTED_NEWSLETTER_EXTENSIONS,
  DELIVERY_HOUR,
  DELIVERY_WINDOW_END_HOUR,
} from "@/entities/newsletter";
import { useDictionary } from "@/shared/i18n";
import { IDLE_STATE } from "@/shared/lib";
import { Field, FormMessage, Input, SubmitButton, Textarea } from "@/shared/ui";
import { uploadNewsletterAction } from "../actions";
import type { PublishMode, UploadNewsletterFormProps } from "../types";

const MODES: PublishMode[] = ["schedule", "now", "draft"];

export const UploadNewsletterForm = ({ earliestDate }: UploadNewsletterFormProps) => {
  const t = useDictionary();
  const [state, formAction] = useActionState(uploadNewsletterAction, IDLE_STATE);
  const errors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    // Uncontrolled radios + CSS :has() keep the date field in sync even after
    // React resets the form following a successful upload.
    <form action={formAction} className="group space-y-4">
      <Field label={t.newsletters.titleLabel} name="title" errors={errors?.title}>
        <Input id="title" name="title" required maxLength={200} />
      </Field>
      <Field label={t.newsletters.summaryLabel} name="summary" hint={t.newsletters.summaryHint} errors={errors?.summary}>
        <Textarea id="summary" name="summary" maxLength={500} className="min-h-16" />
      </Field>
      <Field label={t.newsletters.fileLabel} name="file" hint={t.newsletters.fileHint} errors={errors?.file}>
        <Input id="file" name="file" type="file" required accept={ACCEPTED_NEWSLETTER_EXTENSIONS} />
      </Field>
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">{t.newsletters.when}</legend>
        <div className="flex flex-wrap gap-2">
          {MODES.map((mode) => (
            <label
              key={mode}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-line-strong bg-surface px-3 py-1.5 text-sm transition-colors has-checked:border-brand has-checked:bg-brand-soft has-checked:font-semibold has-checked:text-brand"
            >
              <input type="radio" name="mode" value={mode} defaultChecked={mode === "schedule"} className="accent-brand" />
              {t.newsletters.modes[mode]}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="hidden group-has-[input[value=schedule]:checked]:block">
        <Field
          label={t.newsletters.publishAt}
          name="scheduledDate"
          hint={t.schedule.explanation(DELIVERY_HOUR, DELIVERY_WINDOW_END_HOUR)}
          errors={errors?.scheduledDate ?? errors?.scheduledAt}
        >
          <Input id="scheduledDate" name="scheduledDate" type="date" min={earliestDate} defaultValue={earliestDate} className="sm:w-56" />
        </Field>
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingLabel={t.newsletters.pending}>{t.newsletters.submit}</SubmitButton>
    </form>
  );
};
