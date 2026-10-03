import { cn } from "@/shared/lib";
import type { BadgeProps, BadgeTone } from "./types";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-surface-sunken text-muted ring-line",
  success: "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-900",
  warning: "bg-accent-soft text-accent-ink ring-accent/30",
  danger: "bg-red-50 text-red-800 ring-red-200 dark:bg-red-950 dark:text-red-200 dark:ring-red-900",
  info: "bg-brand-soft text-brand ring-brand/20",
};

export const Badge = ({ tone = "neutral", children }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset first-letter:uppercase",
      TONE_CLASSES[tone],
    )}
  >
    {children}
  </span>
);
