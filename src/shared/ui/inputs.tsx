import { cn } from "@/shared/lib";
import type { InputProps, SelectProps, TextareaProps } from "./types";

const CONTROL_CLASSES =
  "block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-xs placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export const Input = ({ className, ...props }: InputProps) => (
  <input className={cn(CONTROL_CLASSES, className)} {...props} />
);

export const Textarea = ({ className, ...props }: TextareaProps) => (
  <textarea className={cn(CONTROL_CLASSES, "min-h-24", className)} {...props} />
);

export const Select = ({ className, ...props }: SelectProps) => (
  <select className={cn(CONTROL_CLASSES, className)} {...props} />
);
