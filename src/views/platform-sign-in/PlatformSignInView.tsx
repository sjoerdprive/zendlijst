import { SignInForm } from "@/features/auth";
import { Card, Notice, PageContainer } from "@/shared/ui";
import type { SignInViewProps } from "./types";

export const PlatformSignInView = ({ hasLinkError }: SignInViewProps) => (
  <PageContainer width="narrow">
    <div className="space-y-4">
      {hasLinkError && <Notice tone="warning">That sign-in link is invalid or expired. Request a new one.</Notice>}
      <Card title="Platform sign-in" description="For Nieuwsbrief operators. Organisations sign in on their own subdomain.">
        <SignInForm />
      </Card>
    </div>
  </PageContainer>
);
