import { formatDateTime } from "@/shared/lib";
import type { NextIssueProps } from "./types";

export const NextIssue = ({ next }: NextIssueProps) => (
  <div className="rounded-xl bg-zinc-900 p-5 text-white dark:bg-zinc-100 dark:text-zinc-900">
    <p className="text-xs uppercase tracking-wide opacity-70">Next issue</p>
    {next?.scheduledAt ? (
      <p className="mt-1 text-lg font-semibold">
        <time dateTime={next.scheduledAt.toISOString()}>{formatDateTime(next.scheduledAt)}</time>
      </p>
    ) : (
      <p className="mt-1 text-lg font-semibold">Not scheduled yet</p>
    )}
  </div>
);
