"use client";

import { useActionState } from "react";
import { formatDateTime, IDLE_STATE } from "@/shared/lib";
import { Badge, FormMessage, SubmitButton } from "@/shared/ui";
import { reviewRequestAction } from "../actions";
import type { RequestReviewItemProps } from "../types";

export const RequestReviewItem = ({ request, rootDomain }: RequestReviewItemProps) => {
  const [state, formAction] = useActionState(reviewRequestAction, IDLE_STATE);
  return (
    <li className="space-y-3 py-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">{request.organisationName}</p>
          <p className="text-sm text-zinc-500">
            {request.slug}.{rootDomain} · {request.adminEmail} · {formatDateTime(request.createdAt)}
          </p>
        </div>
        <Badge tone={request.status === "pending" ? "warning" : request.status === "approved" ? "success" : "neutral"}>
          {request.status}
        </Badge>
      </div>
      {request.message && <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{request.message}</p>}
      {request.status === "pending" && (
        <form action={formAction} className="flex gap-2">
          <input type="hidden" name="requestId" value={request.id} />
          <SubmitButton name="decision" value="approve" pendingLabel="Working…">
            Approve
          </SubmitButton>
          <SubmitButton name="decision" value="reject" variant="secondary">
            Reject
          </SubmitButton>
        </form>
      )}
      <FormMessage state={state} />
    </li>
  );
};
