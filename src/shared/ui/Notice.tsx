import { cn } from "@/shared/lib";
import type { NoticeProps, NoticeTone } from "./types";

const TONE_CLASSES: Record<NoticeTone, string> = {
  info: "border-brand bg-brand-soft text-ink",
  success: "border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-50",
  warning: "border-accent bg-accent-soft text-ink",
  danger: "border-red-500 bg-red-50 text-red-950 dark:bg-red-950 dark:text-red-50",
};

export const Notice = ({ tone = "info", title, children }: NoticeProps) => (
  <div
    role={tone === "danger" ? "alert" : "status"}
    className={cn("rounded-xl border-l-4 px-4 py-3 text-sm", TONE_CLASSES[tone])}
  >
    {title && <p className="mb-1 font-semibold">{title}</p>}
    {children}
  </div>
);
