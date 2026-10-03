import { getDictionary, getLocale } from "@/shared/i18n/server";
import { formatDateTime } from "@/shared/lib";
import { buttonClasses } from "@/shared/ui";
import type { FailureGroupProps } from "../types";
import { CopyEmailsButton } from "./CopyEmailsButton";
import { ResolveButton } from "./ResolveButton";

export const FailureGroup = async ({ newsletterId, newsletterTitle, failures }: FailureGroupProps) => {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <div className="rounded-2xl border border-red-200 bg-surface p-4 dark:border-red-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">
          “{newsletterTitle}” — {t.failures.notDelivered(failures.length)}
        </p>
        <div className="flex flex-wrap gap-2">
          <a href={`/newsletters/${newsletterId}/file?download=1`} className={buttonClasses("secondary")}>
            {t.failures.download}
          </a>
          <CopyEmailsButton emails={failures.map((failure) => failure.email)} />
          <ResolveButton deliveryIds={failures.map((failure) => failure.id)} label={t.failures.markAllHandled} />
        </div>
      </div>
      <ul className="mt-3 divide-y divide-line">
        {failures.map((failure) => (
          <li key={failure.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
            <div className="min-w-0">
              <p className="break-all font-medium">{failure.email}</p>
              <p className="text-xs text-muted">
                {t.failures.attempts(failure.attempts)} · {t.failures.last(formatDateTime(failure.failedAt, locale))} ·{" "}
                {failure.lastError ?? t.failures.unknownError}
              </p>
            </div>
            <ResolveButton deliveryIds={[failure.id]} label={t.failures.sentManually} />
          </li>
        ))}
      </ul>
    </div>
  );
};
