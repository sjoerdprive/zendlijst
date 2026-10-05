"use client";

import { useRef, useState } from "react";
import { EMPTY_EDITOR_DOCUMENT, type EditorDocument } from "@/entities/newsletter";
import { useDictionary } from "@/shared/i18n";
import { cn } from "@/shared/lib";
import { Button, Field, Input, Notice, Textarea } from "@/shared/ui";
import { useDraftAutosave } from "../lib/useDraftAutosave";
import type { NewsletterEditorProps, SaveState } from "../types";
import { AttachFileForm } from "./AttachFileForm";
import { FileSection } from "./FileSection";
import { NewsletterPreview } from "./NewsletterPreview";
import { RichTextEditor } from "./RichTextEditor";
import { SendPanel } from "./SendPanel";

const STATE_TONES: Record<SaveState, string> = {
  saved: "bg-emerald-500",
  unsaved: "bg-accent",
  saving: "bg-brand animate-pulse",
  error: "bg-danger",
  conflict: "bg-danger",
  locked: "bg-line-strong",
};

export const NewsletterEditor = ({ draft, earliestDate }: NewsletterEditorProps) => {
  const t = useDictionary();
  const isUpload = draft.source === "upload";
  const [title, setTitle] = useState(draft.title);
  const [summary, setSummary] = useState(draft.summary ?? "");
  const bodyRef = useRef<EditorDocument>(draft.body ?? EMPTY_EDITOR_DOCUMENT);

  const autosave = useDraftAutosave({
    initialVersion: draft.version,
    initialHasContent: draft.hasContent,
    leaveWarning: t.editor.leaveWarning,
    collect: () => ({
      newsletterId: draft.id,
      title,
      summary,
      body: isUpload ? null : JSON.stringify(bodyRef.current),
    }),
  });
  const { state, markChanged, flush, discard } = autosave;
  const stopped = state === "conflict" || state === "locked";
  const statusLabel =
    state === "conflict" || state === "locked" ? t.editor.saveStatus.error : t.editor.saveStatus[state];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm text-muted" aria-live="polite">
          <span aria-hidden="true" className={cn("size-2 rounded-full", STATE_TONES[state])} />
          {statusLabel}
        </p>
        <Button variant="secondary" disabled={stopped || state === "saved"} onClick={() => void flush()}>
          {t.editor.save}
        </Button>
      </div>
      {state === "error" && autosave.message && <Notice tone="danger">{autosave.message}</Notice>}
      {stopped && (
        <Notice tone="danger">
          <p>{state === "conflict" ? t.editor.conflict : t.editor.locked}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-2 font-semibold text-brand underline underline-offset-4"
          >
            {t.editor.reload}
          </button>
        </Notice>
      )}

      <div className="space-y-4">
        <Field label={t.editor.titleLabel} name="title">
          <Input
            id="title"
            name="title"
            maxLength={200}
            value={title}
            readOnly={stopped}
            placeholder={t.editor.titlePlaceholder}
            className="font-display text-xl font-semibold"
            onChange={(event) => {
              setTitle(event.target.value);
              markChanged();
            }}
          />
        </Field>
        <Field label={t.editor.summaryLabel} name="summary" hint={t.editor.summaryHint}>
          <Textarea
            id="summary"
            name="summary"
            maxLength={500}
            value={summary}
            readOnly={stopped}
            className="min-h-16"
            onChange={(event) => {
              setSummary(event.target.value);
              markChanged();
            }}
          />
        </Field>
      </div>

      {isUpload ? (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold">{t.editor.fileTitle}</h2>
          <FileSection
            newsletterId={draft.id}
            fileName={draft.fileName}
            canRemove={draft.status === "draft"}
            flush={flush}
          />
        </section>
      ) : (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">{t.editor.bodyLabel}</h2>
          <RichTextEditor
            initialContent={draft.body}
            editable={!stopped}
            label={t.editor.bodyLabel}
            placeholder={t.editor.bodyPlaceholder}
            onChange={(document) => {
              bodyRef.current = document;
              markChanged();
            }}
          />
          <p className="text-xs text-muted">{t.editor.imageHint}</p>
          <details className="rounded-xl border border-line px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-brand">{t.editor.useFileInstead}</summary>
            <div className="mt-3">
              <AttachFileForm
                newsletterId={draft.id}
                replacesText={autosave.hasContent}
                label={t.newsletters.fileLabel}
                flush={flush}
              />
            </div>
          </details>
        </section>
      )}

      <NewsletterPreview
        newsletterId={draft.id}
        isHtml={draft.contentType !== "application/pdf"}
        hasContent={autosave.hasContent}
        version={autosave.version}
      />

      <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm shadow-ink/5">
        <h2 className="mb-4 font-display text-lg font-semibold">{t.editor.sendTitle}</h2>
        <SendPanel
          newsletterId={draft.id}
          title={title}
          status={draft.status}
          scheduledAt={draft.scheduledAt}
          earliestDate={earliestDate}
          flush={flush}
          discard={discard}
        />
      </section>
    </div>
  );
};
