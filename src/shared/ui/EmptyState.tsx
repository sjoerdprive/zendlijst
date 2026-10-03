import type { EmptyStateProps } from "./types";

export const EmptyState = ({ title, children }: EmptyStateProps) => (
  <div className="rounded-xl border border-dashed border-line-strong bg-surface-sunken/60 px-6 py-10 text-center">
    <span aria-hidden="true" className="mx-auto mb-3 block size-2 rounded-full bg-accent" />
    <p className="text-sm font-semibold">{title}</p>
    {children && <div className="mt-1 text-sm text-muted">{children}</div>}
  </div>
);
