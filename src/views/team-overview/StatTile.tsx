import type { StatTileProps } from "./types";

export const StatTile = ({ label, value, hint }: StatTileProps) => (
  <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
    <p className="mt-1 text-2xl font-semibold">{value}</p>
    {hint && <p className="text-xs text-zinc-500">{hint}</p>}
  </div>
);
