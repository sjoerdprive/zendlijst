"use client";

import { useActionState } from "react";
import { ACCEPTED_NEWSLETTER_EXTENSIONS } from "@/entities/newsletter";
import { useDictionary } from "@/shared/i18n";
import { IDLE_STATE, useFullPageRedirect } from "@/shared/lib";
import { Field, FormMessage, Input, SubmitButton } from "@/shared/ui";
import { attachFileAction } from "../actions";
import { useGuardedSubmit } from "../lib/useGuardedSubmit";
import type { AttachFileFormProps } from "../types";

export const AttachFileForm = ({ newsletterId, replacesText, label, flush }: AttachFileFormProps) => {
  const t = useDictionary();
  const [state, formAction] = useActionState(attachFileAction, IDLE_STATE);
  useFullPageRedirect(state);
  const onSubmit = useGuardedSubmit(flush, () => (replacesText ? t.editor.replaceTextWarning : null));
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-3">
      <input type="hidden" name="newsletterId" value={newsletterId} />
      <Field label={label} name="file" hint={t.newsletters.fileHint} errors={errors?.file}>
        <Input id="file" name="file" type="file" required accept={ACCEPTED_NEWSLETTER_EXTENSIONS} />
      </Field>
      {state.status === "error" && <FormMessage state={state} />}
      <SubmitButton variant="secondary" pendingLabel={t.editor.attaching}>
        {t.editor.attachFile}
      </SubmitButton>
    </form>
  );
};
