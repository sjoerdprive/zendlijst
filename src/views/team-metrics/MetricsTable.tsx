import Link from "next/link";
import { publishedAt } from "@/entities/newsletter";
import { getDictionary, getLocale } from "@/shared/i18n/server";
import { formatDate, formatPercent } from "@/shared/lib";
import { DeliveryBar } from "./DeliveryBar";
import type { MetricsTableProps } from "./types";

export const MetricsTable = async ({ issues }: MetricsTableProps) => {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-muted">
          <tr>
            <th className="py-2 pr-4 font-semibold">{t.metrics.columns.issue}</th>
            <th className="py-2 pr-4 text-right font-semibold">{t.metrics.columns.recipients}</th>
            <th className="py-2 pr-4 font-semibold">{t.metrics.columns.delivered}</th>
            <th className="py-2 pr-4 text-right font-semibold">{t.metrics.columns.failed}</th>
            <th className="py-2 text-right font-semibold">{t.metrics.columns.readers}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line align-top">
          {issues.map(({ newsletter, stats, readers }) => {
            const sent = stats?.sent ?? 0;
            const failed = stats?.failed ?? 0;
            const pending = stats?.pending ?? 0;
            const finished = sent + failed;
            const date = publishedAt(newsletter);
            return (
              <tr key={newsletter.id}>
                <td className="py-3 pr-4">
                  <Link href={`/newsletters/${newsletter.id}`} className="font-semibold hover:text-brand hover:underline">
                    {newsletter.title}
                  </Link>
                  {date && <p className="text-xs text-muted">{formatDate(date, locale)}</p>}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">{finished + pending}</td>
                <td className="py-3 pr-4">
                  <span className="tabular-nums">
                    {sent}
                    {finished > 0 && <span className="text-muted"> · {formatPercent(sent / finished, locale)}</span>}
                  </span>
                  {finished > 0 && <DeliveryBar ratio={sent / finished} />}
                  {pending > 0 && <p className="text-xs text-accent-ink">{t.metrics.pending(pending)}</p>}
                </td>
                <td className={failed > 0 ? "py-3 pr-4 text-right font-semibold text-danger tabular-nums" : "py-3 pr-4 text-right tabular-nums"}>
                  {failed}
                </td>
                <td className="py-3 text-right tabular-nums">{readers}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
