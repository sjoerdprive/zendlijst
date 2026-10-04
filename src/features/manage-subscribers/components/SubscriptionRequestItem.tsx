"use client";

import { useDictionary, useLocale } from "@/shared/i18n";
import { formatDateTime } from "@/shared/lib";
import { SubmitButton } from "@/shared/ui";
import type { SubscriptionRequestItemProps } from "../types";

export const SubscriptionRequestItem = ({ request, formAction }: SubscriptionRequestItemProps) => {
  const t = useDictionary();
  const locale = useLocale();
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="break-all text-sm font-semibold">{request.email}</p>
        <p className="text-xs text-muted">{t.requests.requestedAt(formatDateTime(request.createdAt, locale))}</p>
      </div>
      <form action={formAction} className="flex gap-2">
        <input type="hidden" name="requestId" value={request.id} />
        <SubmitButton name="decision" value="approve" pendingLabel={t.requests.working}>
          {t.requests.approve}
        </SubmitButton>
        <SubmitButton name="decision" value="reject" variant="secondary">
          {t.requests.reject}
        </SubmitButton>
      </form>
    </li>
  );
};
