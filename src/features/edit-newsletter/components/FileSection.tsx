"use client";

import { useActionState } from "react";
import { useDictionary } from "@/shared/i18n";
import { IDLE_STATE, useFullPageRedirect } from "@/shared/lib";
import { FormMessage, SubmitButton } from "@/shared/ui";
import { clearFileAction } from "../actions";
import { useGuardedSubmit } from "../lib/useGuardedSubmit";
import type { FileSectionProps } from "../types";
import { AttachFileForm } from "./AttachFileForm";

// For newsletters made from an uploaded PDF or HTML file.
export const FileSection = ({ newsletterId, fileName, canRemove, flush }: FileSectionProps) => {
  const t = useDictionary();
  const [state, formAction] = useActionState(clearFileAction, IDLE_STATE);
  useFullPageRedirect(state);
  const onRemove = useGuardedSubmit(flush, () => t.editor.confirmRemoveFile);
  return (
    <div className="space-y-5 rounded-xl border border-line bg-surface-sunken/60 p-4">
      {fileName && <p className="text-sm font-semibold">{t.editor.currentFile(fileName)}</p>}
      <AttachFileForm newsletterId={newsletterId} replacesText={false} label={t.editor.replaceFile} flush={flush} />
      {canRemove && (
        <form action={formAction} onSubmit={onRemove} className="border-t border-line pt-4">
          <input type="hidden" name="newsletterId" value={newsletterId} />
          <SubmitButton variant="ghost">{t.editor.removeFile}</SubmitButton>
          {state.status === "error" && <FormMessage state={state} />}
        </form>
      )}
    </div>
  );
};
