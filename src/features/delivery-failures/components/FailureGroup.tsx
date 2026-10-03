import { buttonClasses } from "@/shared/ui";
import { formatDateTime } from "@/shared/lib";
import type { FailureGroupProps } from "../types";
import { CopyEmailsButton } from "./CopyEmailsButton";
import { ResolveButton } from "./ResolveButton";

export const FailureGroup = ({ newsletterId, newsletterTitle, failures }: FailureGroupProps) => (
  <div className="rounded-lg border border-red-200 bg-white p-4 dark:border-red-900 dark:bg-zinc-900">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="font-medium">
        “{newsletterTitle}” — {failures.length} not delivered
      </p>
      <div className="flex flex-wrap gap-2">
        <a href={`/newsletters/${newsletterId}/file?download=1`} className={buttonClasses("secondary")}>
          Download newsletter
        </a>
        <CopyEmailsButton emails={failures.map((failure) => failure.email)} />
        <ResolveButton deliveryIds={failures.map((failure) => failure.id)} label="Mark all handled" />
      </div>
    </div>
    <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
      {failures.map((failure) => (
        <li key={failure.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
          <div className="min-w-0">
            <p className="break-all font-medium">{failure.email}</p>
            <p className="text-xs text-zinc-500">
              {failure.attempts} attempts · last {formatDateTime(failure.failedAt)} · {failure.lastError ?? "Unknown error"}
            </p>
          </div>
          <ResolveButton deliveryIds={[failure.id]} label="Sent manually" />
        </li>
      ))}
    </ul>
  </div>
);
