import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import type { ActionState } from "@/shared/lib";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "dangerGhost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export interface SubmitButtonProps extends ButtonProps {
  pendingLabel?: string;
}

export interface FieldProps {
  label: string;
  name: string;
  hint?: string;
  errors?: string[];
  children: ReactNode;
}

export type InputProps = ComponentProps<"input">;

export type TextareaProps = ComponentProps<"textarea">;

export type SelectProps = ComponentProps<"select">;

export interface CardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export type NoticeTone = "info" | "success" | "warning" | "danger";

export interface NoticeProps {
  tone?: NoticeTone;
  title?: string;
  children: ReactNode;
}

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
}

export interface FormMessageProps {
  state: ActionState;
}

export interface PageContainerProps {
  children: ReactNode;
  width?: "narrow" | "wide";
}

export interface EmptyStateProps {
  title: string;
  children?: ReactNode;
}

export type StatTileTone = "brand" | "accent" | "neutral";

export interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
  tone?: StatTileTone;
}
