"use client";

import { useActionState } from "react";
import { useDictionary, useLocale } from "@/shared/i18n";
import { formatDateTime, IDLE_STATE } from "@/shared/lib";
import { Badge, FormMessage, SubmitButton } from "@/shared/ui";
import { reviewRequestAction } from "../actions";
import type { RequestReviewItemProps } from "../types";

export const RequestReviewItem = ({ request, rootDomain }: RequestReviewItemProps) => {
  const t = useDictionary();
  const locale = useLocale();
  const [state, formAction] = useActionState(reviewRequestAction, IDLE_STATE);
  return (
    <li className="space-y-3 py-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold">{request.organisationName}</p>
          <p className="text-sm text-muted">
            {request.slug}.{rootDomain} · {request.adminEmail} · {formatDateTime(request.createdAt, locale)}
          </p>
        </div>
        <Badge tone={request.status === "pending" ? "warning" : request.status === "approved" ? "success" : "neutral"}>
          {t.platformAdmin.statuses[request.status]}
        </Badge>
      </div>
      {request.message && <p className="whitespace-pre-wrap rounded-xl bg-surface-sunken p-3 text-sm">{request.message}</p>}
      {request.status === "pending" && (
        <form action={formAction} className="flex gap-2">
          <input type="hidden" name="requestId" value={request.id} />
          <SubmitButton name="decision" value="approve" pendingLabel={t.platformAdmin.working}>
            {t.platformAdmin.approve}
          </SubmitButton>
          <SubmitButton name="decision" value="reject" variant="secondary">
            {t.platformAdmin.reject}
          </SubmitButton>
        </form>
      )}
      <FormMessage state={state} />
    </li>
  );
};
