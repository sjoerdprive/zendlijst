import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { TokenUnsubscribeForm } from "@/features/manage-subscription";
import { getDictionary } from "@/shared/i18n/server";
import { Card, Notice, PageContainer } from "@/shared/ui";
import type { UnsubscribeViewProps } from "./types";

export const UnsubscribeView = async ({ token }: UnsubscribeViewProps) => {
  const [organisation, t] = await Promise.all([requireCurrentOrganisation(), getDictionary()]);
  return (
    <PageContainer width="narrow">
      <Card title={t.unsubscribe.title(organisation.name)} description={t.unsubscribe.description}>
        {token ? <TokenUnsubscribeForm token={token} /> : <Notice tone="warning">{t.unsubscribe.incomplete}</Notice>}
      </Card>
    </PageContainer>
  );
};
