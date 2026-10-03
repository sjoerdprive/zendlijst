import Link from "next/link";
import { formatDate } from "@/shared/lib";
import type { NewsletterCardProps } from "../types";
import { publishedAt } from "../utils";

export const NewsletterCard = ({ newsletter, href }: NewsletterCardProps) => {
  const date = publishedAt(newsletter);
  return (
    <Link
      href={href}
      className="block rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
    >
      <p className="text-xs uppercase tracking-wide text-zinc-500">
        {date ? formatDate(date) : "Unscheduled"} · {newsletter.contentType === "application/pdf" ? "PDF" : "Web"}
      </p>
      <h3 className="mt-1 font-semibold">{newsletter.title}</h3>
      {newsletter.summary && <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{newsletter.summary}</p>}
    </Link>
  );
};
