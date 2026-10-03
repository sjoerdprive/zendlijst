import { cn } from "@/shared/lib";
import type { PageContainerProps } from "./types";

export const PageContainer = ({ children, width = "wide" }: PageContainerProps) => (
  <main className={cn("mx-auto w-full flex-1 px-4 py-10 sm:px-6", width === "narrow" ? "max-w-xl" : "max-w-5xl")}>
    {children}
  </main>
);
