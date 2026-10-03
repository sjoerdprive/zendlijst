import { buttonClasses } from "@/shared/ui";
import type { NewsletterViewerProps } from "../types";

export const NewsletterViewer = ({ newsletter }: NewsletterViewerProps) => {
  const fileUrl = `/newsletters/${newsletter.id}/file`;
  const isHtml = newsletter.contentType === "text/html";
  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-2">
        <a href={fileUrl} target="_blank" rel="noopener" className={buttonClasses("secondary")}>
          Open in new tab
        </a>
        <a href={`${fileUrl}?download=1`} className={buttonClasses("secondary")}>
          Download
        </a>
      </div>
      <iframe
        src={fileUrl}
        title={newsletter.title}
        // HTML gets a script-less sandbox; PDF viewers need an unsandboxed frame.
        sandbox={isHtml ? "allow-popups allow-popups-to-escape-sandbox" : undefined}
        className="h-[75vh] w-full rounded-xl border border-zinc-200 bg-white dark:border-zinc-800"
      />
    </div>
  );
};
