import { SignInForm } from "@/features/auth";
import { getDictionary } from "@/shared/i18n/server";
import { Card, Notice, PageContainer } from "@/shared/ui";
import type { SignInViewProps } from "./types";

export const PlatformSignInView = async ({ hasLinkError }: SignInViewProps) => {
  const t = await getDictionary();
  return (
    <PageContainer width="narrow">
      <div className="space-y-4">
        {hasLinkError && <Notice tone="warning">{t.signIn.linkError}</Notice>}
        <Card title={t.signIn.platformTitle} description={t.signIn.platformDescription}>
          <SignInForm />
        </Card>
      </div>
    </PageContainer>
  );
};
