import { cn } from "@/shared/lib";
import type { InputProps, SelectProps, TextareaProps } from "./types";

const CONTROL_CLASSES =
  "block w-full rounded-xl border border-line-strong bg-surface px-3 py-2 text-sm text-ink shadow-xs placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 disabled:opacity-60 file:mr-3 file:rounded-full file:border-0 file:bg-brand-soft file:px-3 file:py-1 file:text-sm file:font-semibold file:text-brand";

export const Input = ({ className, ...props }: InputProps) => (
  <input className={cn(CONTROL_CLASSES, className)} {...props} />
);

export const Textarea = ({ className, ...props }: TextareaProps) => (
  <textarea className={cn(CONTROL_CLASSES, "min-h-24", className)} {...props} />
);

export const Select = ({ className, ...props }: SelectProps) => (
  <select className={cn(CONTROL_CLASSES, className)} {...props} />
);
