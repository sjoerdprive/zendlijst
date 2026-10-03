import { EmptyState } from "@/shared/ui";
import type { RequestReviewListProps } from "../types";
import { RequestReviewItem } from "./RequestReviewItem";

export const RequestReviewList = ({ requests, rootDomain }: RequestReviewListProps) => {
  if (requests.length === 0) return <EmptyState title="No organisation requests yet." />;
  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {requests.map((request) => (
        <RequestReviewItem key={request.id} request={request} rootDomain={rootDomain} />
      ))}
    </ul>
  );
};
