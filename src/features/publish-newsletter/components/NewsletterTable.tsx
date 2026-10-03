import Link from "next/link";
import { NewsletterStatusBadge, publishedAt } from "@/entities/newsletter";
import { getDictionary, getLocale } from "@/shared/i18n/server";
import { formatDateTime } from "@/shared/lib";
import { EmptyState } from "@/shared/ui";
import type { NewsletterTableProps } from "../types";
import { DeliveryProgress } from "./DeliveryProgress";
import { NewsletterRowActions } from "./NewsletterRowActions";

export const NewsletterTable = async ({ rows }: NewsletterTableProps) => {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  if (rows.length === 0) return <EmptyState title={t.newsletters.emptyTitle}>{t.newsletters.emptyBody}</EmptyState>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-muted">
          <tr>
            <th className="py-2 pr-4 font-semibold">{t.newsletters.columns.title}</th>
            <th className="py-2 pr-4 font-semibold">{t.newsletters.columns.status}</th>
            <th className="py-2 pr-4 font-semibold">{t.newsletters.columns.date}</th>
            <th className="py-2 pr-4 font-semibold">{t.newsletters.columns.delivery}</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line align-top">
          {rows.map(({ newsletter, stats }) => {
            const date = publishedAt(newsletter);
            return (
              <tr key={newsletter.id}>
                <td className="py-3 pr-4">
                  <Link href={`/newsletters/${newsletter.id}`} className="font-semibold hover:text-brand hover:underline">
                    {newsletter.title}
                  </Link>
                  <p className="text-xs text-muted">{newsletter.fileName}</p>
                </td>
                <td className="py-3 pr-4">
                  <NewsletterStatusBadge status={newsletter.status} />
                </td>
                <td className="py-3 pr-4 whitespace-nowrap">{date ? formatDateTime(date, locale) : "—"}</td>
                <td className="py-3 pr-4">
                  <DeliveryProgress stats={stats} />
                </td>
                <td className="py-3 text-right">
                  <NewsletterRowActions newsletter={newsletter} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
