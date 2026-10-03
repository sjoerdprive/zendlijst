import { getDictionary } from "@/shared/i18n/server";
import { buttonClasses } from "@/shared/ui";
import type { NewsletterViewerProps } from "../types";

export const NewsletterViewer = async ({ newsletter }: NewsletterViewerProps) => {
  const t = await getDictionary();
  const fileUrl = `/newsletters/${newsletter.id}/file`;
  const isHtml = newsletter.contentType === "text/html";
  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-2">
        <a href={fileUrl} target="_blank" rel="noopener" className={buttonClasses("secondary")}>
          {t.newsletterPage.openInNewTab}
        </a>
        <a href={`${fileUrl}?download=1`} className={buttonClasses("secondary")}>
          {t.newsletterPage.download}
        </a>
      </div>
      <iframe
        src={fileUrl}
        title={newsletter.title}
        // HTML gets a script-less sandbox; PDF viewers need an unsandboxed frame.
        sandbox={isHtml ? "allow-popups allow-popups-to-escape-sandbox" : undefined}
        className="h-[75vh] w-full rounded-2xl border border-line bg-white shadow-sm shadow-ink/5"
      />
    </div>
  );
};
