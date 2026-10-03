import { cn } from "@/shared/lib";
import type { ButtonProps, ButtonVariant } from "./types";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300",
  secondary:
    "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
  danger: "bg-red-600 text-white hover:bg-red-500",
  ghost: "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
};

export const buttonClasses = (variant: ButtonVariant = "primary", className?: string) =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60",
    VARIANT_CLASSES[variant],
    className,
  );

export const Button = ({ variant = "primary", className, type = "button", ...props }: ButtonProps) => (
  <button type={type} className={buttonClasses(variant, className)} {...props} />
);
