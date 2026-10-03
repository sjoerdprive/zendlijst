import { cn } from "@/shared/lib";
import type { CardProps } from "./types";

export const Card = ({ title, description, actions, children, className }: CardProps) => (
  <section className={cn("rounded-2xl border border-line bg-surface p-6 shadow-sm shadow-ink/5", className)}>
    {(title || actions) && (
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          {title && <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>}
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        {actions}
      </header>
    )}
    {children}
  </section>
);
