import Link from "next/link";
import { describeDelivery, isEditable, newsletterDisplayTitle, NewsletterStatusBadge } from "@/entities/newsletter";
import type { NewsletterSummary } from "@/entities/newsletter";
import type { Dictionary, Locale } from "@/shared/i18n";
import { getDictionary, getLocale } from "@/shared/i18n/server";
import { formatDateTime } from "@/shared/lib";
import { buttonClasses, EmptyState } from "@/shared/ui";
import type { NewsletterTableProps } from "../types";
import { DeliveryProgress } from "./DeliveryProgress";

// Scheduled issues show their delivery window; sent ones when they went out.
const dateLabel = (newsletter: NewsletterSummary, t: Dictionary, locale: Locale): string => {
  if (newsletter.sentAt) return formatDateTime(newsletter.sentAt, locale);
  if (newsletter.status === "scheduled" && newsletter.scheduledAt) {
    return describeDelivery(newsletter.scheduledAt, t, locale);
  }
  return "—";
};

// Drafts and scheduled issues open in the editor; sent ones in the archive.
const hrefFor = (newsletter: NewsletterSummary): string =>
  isEditable(newsletter.status) ? `/team/newsletters/${newsletter.id}` : `/newsletters/${newsletter.id}`;

export const NewsletterTable = async ({ rows, emptyTitle, showDelivery = true }: NewsletterTableProps) => {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  if (rows.length === 0) return <EmptyState title={emptyTitle} />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-muted">
          <tr>
            <th className="py-2 pr-4 font-semibold">{t.newsletters.columns.title}</th>
            <th className="py-2 pr-4 font-semibold">{t.newsletters.columns.status}</th>
            <th className="py-2 pr-4 font-semibold">{t.newsletters.columns.date}</th>
            {showDelivery && <th className="py-2 pr-4 font-semibold">{t.newsletters.columns.delivery}</th>}
            <th className="py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line align-top">
          {rows.map(({ newsletter, stats }) => {
            return (
              <tr key={newsletter.id}>
                <td className="py-3 pr-4">
                  <Link href={hrefFor(newsletter)} className="font-semibold hover:text-brand hover:underline">
                    {newsletterDisplayTitle(newsletter.title, t.newsletters.untitled)}
                  </Link>
                  {newsletter.fileName && <p className="text-xs text-muted">{newsletter.fileName}</p>}
                </td>
                <td className="py-3 pr-4">
                  <NewsletterStatusBadge status={newsletter.status} />
                </td>
                <td className="py-3 pr-4">{dateLabel(newsletter, t, locale)}</td>
                {showDelivery && (
                  <td className="py-3 pr-4">
                    <DeliveryProgress stats={stats} />
                  </td>
                )}
                <td className="py-3 text-right">
                  {isEditable(newsletter.status) && (
                    <Link href={hrefFor(newsletter)} className={buttonClasses("ghost")}>
                      {t.newsletters.edit}
                    </Link>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
