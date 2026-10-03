import { cn } from "@/shared/lib";
import type { StatTileProps, StatTileTone } from "./types";

const TONE_CLASSES: Record<StatTileTone, string> = {
  brand: "bg-brand",
  accent: "bg-accent",
  neutral: "bg-line-strong",
};

export const StatTile = ({ label, value, hint, tone = "neutral" }: StatTileProps) => (
  <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-4 pt-5 shadow-sm shadow-ink/5">
    <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-1", TONE_CLASSES[tone])} />
    <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
    <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
    {hint && <p className="truncate text-xs text-muted">{hint}</p>}
  </div>
);
