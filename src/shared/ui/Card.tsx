import { cn } from "@/shared/lib";
import type { CardProps } from "./types";

export const Card = ({ title, description, actions, children, className }: CardProps) => (
  <section
    className={cn(
      "rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900",
      className,
    )}
  >
    {(title || actions) && (
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
        </div>
        {actions}
      </header>
    )}
    {children}
  </section>
);
