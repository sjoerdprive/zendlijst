import Link from "next/link";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { SignInForm } from "@/features/auth";
import { getDictionary } from "@/shared/i18n/server";
import { Card, Notice, PageContainer } from "@/shared/ui";
import type { TenantSignInViewProps } from "./types";

export const TenantSignInView = async ({ hasLinkError }: TenantSignInViewProps) => {
  const [organisation, t] = await Promise.all([requireCurrentOrganisation(), getDictionary()]);
  return (
    <PageContainer width="narrow">
      <div className="space-y-4">
        {hasLinkError && <Notice tone="warning">{t.signIn.linkError}</Notice>}
        <Card title={t.signIn.tenantTitle(organisation.name)} description={t.signIn.tenantDescription} className="border-t-4 border-t-brand">
          <SignInForm />
        </Card>
        <p className="text-center text-sm text-muted">
          {t.signIn.notSubscribed}{" "}
          <Link href="/" className="font-semibold text-brand underline decoration-accent decoration-2 underline-offset-4">
            {t.signIn.subscribe}
          </Link>
        </p>
      </div>
    </PageContainer>
  );
};
