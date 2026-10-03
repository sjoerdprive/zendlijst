"use client";

import { useActionState } from "react";
import { ACCEPTED_NEWSLETTER_EXTENSIONS } from "@/entities/newsletter";
import { IDLE_STATE } from "@/shared/lib";
import { DateTimeInput, Field, FormMessage, Input, SubmitButton, Textarea } from "@/shared/ui";
import { uploadNewsletterAction } from "../actions";
import type { PublishMode } from "../types";

const MODES: Array<{ value: PublishMode; label: string }> = [
  { value: "schedule", label: "Schedule" },
  { value: "now", label: "Send now" },
  { value: "draft", label: "Save as draft" },
];

export const UploadNewsletterForm = () => {
  const [state, formAction] = useActionState(uploadNewsletterAction, IDLE_STATE);
  const errors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    // Uncontrolled radios + CSS :has() keep the date field in sync even after
    // React resets the form following a successful upload.
    <form action={formAction} className="group space-y-4">
      <Field label="Title" name="title" errors={errors?.title}>
        <Input id="title" name="title" required maxLength={200} />
      </Field>
      <Field label="Short summary (optional)" name="summary" hint="Shown in the archive and in the email preview." errors={errors?.summary}>
        <Textarea id="summary" name="summary" maxLength={500} className="min-h-16" />
      </Field>
      <Field label="Newsletter file" name="file" hint="HTML (sent as the email body) or PDF (sent as attachment). Max 8 MB." errors={errors?.file}>
        <Input id="file" name="file" type="file" required accept={ACCEPTED_NEWSLETTER_EXTENSIONS} />
      </Field>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">When</legend>
        <div className="flex flex-wrap gap-4">
          {MODES.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm">
              <input type="radio" name="mode" value={option.value} defaultChecked={option.value === "schedule"} />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="hidden group-has-[input[value=schedule]:checked]:block">
        <Field label="Publish at" name="scheduledAt" errors={errors?.scheduledAt}>
          <DateTimeInput id="scheduledAt" name="scheduledAt" />
        </Field>
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingLabel="Uploading…">Upload newsletter</SubmitButton>
    </form>
  );
};
