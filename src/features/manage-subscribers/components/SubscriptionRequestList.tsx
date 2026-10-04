"use client";

import { useActionState } from "react";
import { useDictionary } from "@/shared/i18n";
import { IDLE_STATE } from "@/shared/lib";
import { EmptyState, FormMessage } from "@/shared/ui";
import { reviewSubscriptionRequestAction } from "../actions";
import type { SubscriptionRequestListProps } from "../types";
import { SubscriptionRequestItem } from "./SubscriptionRequestItem";

// The result message lives here, not in the item: an approved request
// disappears from the list on refresh, but its confirmation should not.
export const SubscriptionRequestList = ({ requests }: SubscriptionRequestListProps) => {
  const t = useDictionary();
  const [state, formAction] = useActionState(reviewSubscriptionRequestAction, IDLE_STATE);
  return (
    <div className="space-y-3">
      <FormMessage state={state} />
      {requests.length === 0 ? (
        <EmptyState title={t.requests.empty} />
      ) : (
        <ul className="divide-y divide-line">
          {requests.map((request) => (
            <SubscriptionRequestItem key={request.id} request={request} formAction={formAction} />
          ))}
        </ul>
      )}
    </div>
  );
};
