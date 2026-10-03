import { cn } from "@/shared/lib";
import type { NoticeProps, NoticeTone } from "./types";

const TONE_CLASSES: Record<NoticeTone, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",
  danger: "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100",
};

export const Notice = ({ tone = "info", title, children }: NoticeProps) => (
  <div
    role={tone === "danger" ? "alert" : "status"}
    className={cn("rounded-lg border px-4 py-3 text-sm", TONE_CLASSES[tone])}
  >
    {title && <p className="mb-1 font-semibold">{title}</p>}
    {children}
  </div>
);
