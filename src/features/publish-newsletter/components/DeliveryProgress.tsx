import type { DeliveryProgressProps } from "../types";

export const DeliveryProgress = ({ stats }: DeliveryProgressProps) => {
  if (!stats) return <span className="text-zinc-400">—</span>;
  return (
    <span className="whitespace-nowrap">
      {stats.sent} sent
      {stats.pending > 0 && <span className="text-amber-600"> · {stats.pending} pending</span>}
      {stats.failed > 0 && <span className="text-red-600"> · {stats.failed} failed</span>}
    </span>
  );
};
