import { getDictionary } from "@/shared/i18n/server";
import type { DeliveryProgressProps } from "../types";

export const DeliveryProgress = async ({ stats }: DeliveryProgressProps) => {
  if (!stats) return <span className="text-muted">—</span>;
  const t = await getDictionary();
  return (
    <span className="whitespace-nowrap">
      {t.newsletters.progressSent(stats.sent)}
      {stats.pending > 0 && <span className="text-accent-ink"> · {t.newsletters.progressPending(stats.pending)}</span>}
      {stats.failed > 0 && <span className="text-danger"> · {t.newsletters.progressFailed(stats.failed)}</span>}
    </span>
  );
};
