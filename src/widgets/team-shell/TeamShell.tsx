import { PageContainer } from "@/shared/ui";
import { TeamNav } from "./TeamNav";
import type { TeamShellProps } from "./types";

export const TeamShell = ({ role, title, description, children }: TeamShellProps) => (
  <PageContainer>
    <div className="space-y-6">
      <TeamNav role={role} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      </div>
      {children}
    </div>
  </PageContainer>
);
