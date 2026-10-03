import type { EmptyStateProps } from "./types";

export const EmptyState = ({ title, children }: EmptyStateProps) => (
  <div className="rounded-lg border border-dashed border-zinc-300 px-6 py-10 text-center dark:border-zinc-700">
    <p className="text-sm font-medium">{title}</p>
    {children && <div className="mt-1 text-sm text-zinc-500">{children}</div>}
  </div>
);
