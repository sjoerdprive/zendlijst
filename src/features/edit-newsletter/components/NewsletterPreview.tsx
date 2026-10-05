"use client";

import { useState } from "react";
import { useDictionary } from "@/shared/i18n";
import type { NewsletterPreviewProps } from "../types";

// Loads the saved version only while opened; reloads after every save.
export const NewsletterPreview = ({ newsletterId, isHtml, hasContent, version }: NewsletterPreviewProps) => {
  const t = useDictionary();
  const [open, setOpen] = useState(false);
  return (
    <details
      className="rounded-2xl border border-line bg-surface p-4 shadow-sm shadow-ink/5"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="cursor-pointer font-display font-semibold">{t.editor.preview}</summary>
      {open &&
        (hasContent ? (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted">{t.editor.previewHint}</p>
            <iframe
              key={version}
              src={`/newsletters/${newsletterId}/file?v=${version}`}
              title={t.editor.preview}
              // Same sandbox as the archive; PDF viewers need an unsandboxed frame.
              sandbox={isHtml ? "allow-popups allow-popups-to-escape-sandbox" : undefined}
              className="h-[70vh] w-full rounded-xl border border-line bg-white"
            />
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">{t.editor.noPreview}</p>
        ))}
    </details>
  );
};
