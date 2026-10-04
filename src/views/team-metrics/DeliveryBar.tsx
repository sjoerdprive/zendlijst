import type { DeliveryBarProps } from "./types";

// Single-series bar; the exact numbers sit next to it, so it is decorative.
export const DeliveryBar = ({ ratio }: DeliveryBarProps) => (
  <span aria-hidden="true" className="mt-1 block h-1.5 w-24 overflow-hidden rounded-full bg-surface-sunken">
    <span className="block h-full rounded-full bg-brand" style={{ width: `${Math.round(ratio * 100)}%` }} />
  </span>
);
