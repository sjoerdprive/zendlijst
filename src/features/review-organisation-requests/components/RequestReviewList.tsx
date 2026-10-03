import { getDictionary } from "@/shared/i18n/server";
import { EmptyState } from "@/shared/ui";
import type { RequestReviewListProps } from "../types";
import { RequestReviewItem } from "./RequestReviewItem";

export const RequestReviewList = async ({ requests, rootDomain }: RequestReviewListProps) => {
  if (requests.length === 0) {
    const t = await getDictionary();
    return <EmptyState title={t.platformAdmin.empty} />;
  }
  return (
    <ul className="divide-y divide-line">
      {requests.map((request) => (
        <RequestReviewItem key={request.id} request={request} rootDomain={rootDomain} />
      ))}
    </ul>
  );
};
