import { cn } from "@/shared/lib";
import type { ButtonProps, ButtonVariant } from "./types";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-brand text-on-brand shadow-sm shadow-brand/20 hover:bg-brand-strong",
  secondary: "border border-line-strong bg-surface text-ink hover:border-brand hover:text-brand",
  danger: "bg-danger text-white hover:opacity-90 dark:text-zinc-950",
  ghost: "text-muted hover:bg-brand-soft hover:text-brand",
  dangerGhost: "text-danger hover:bg-red-50 dark:hover:bg-red-950",
};

export const buttonClasses = (variant: ButtonVariant = "primary", className?: string) =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60",
    VARIANT_CLASSES[variant],
    className,
  );

export const Button = ({ variant = "primary", className, type = "button", ...props }: ButtonProps) => (
  <button type={type} className={buttonClasses(variant, className)} {...props} />
);
