import Link from "next/link";
import { NewsletterStatusBadge, publishedAt } from "@/entities/newsletter";
import { formatDateTime } from "@/shared/lib";
import { EmptyState } from "@/shared/ui";
import type { NewsletterTableProps } from "../types";
import { DeliveryProgress } from "./DeliveryProgress";
import { NewsletterRowActions } from "./NewsletterRowActions";

export const NewsletterTable = ({ rows }: NewsletterTableProps) => {
  if (rows.length === 0) return <EmptyState title="No newsletters yet.">Upload your first issue above.</EmptyState>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase text-zinc-500">
          <tr>
            <th className="py-2 pr-4 font-medium">Title</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 pr-4 font-medium">Date</th>
            <th className="py-2 pr-4 font-medium">Delivery</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 align-top dark:divide-zinc-800">
          {rows.map(({ newsletter, stats }) => {
            const date = publishedAt(newsletter);
            return (
              <tr key={newsletter.id}>
                <td className="py-3 pr-4">
                  <Link href={`/newsletters/${newsletter.id}`} className="font-medium hover:underline">
                    {newsletter.title}
                  </Link>
                  <p className="text-xs text-zinc-500">{newsletter.fileName}</p>
                </td>
                <td className="py-3 pr-4">
                  <NewsletterStatusBadge status={newsletter.status} />
                </td>
                <td className="py-3 pr-4 whitespace-nowrap">{date ? formatDateTime(date) : "—"}</td>
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
