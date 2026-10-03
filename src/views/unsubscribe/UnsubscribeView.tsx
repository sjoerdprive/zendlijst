import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { TokenUnsubscribeForm } from "@/features/manage-subscription";
import { Card, Notice, PageContainer } from "@/shared/ui";
import type { UnsubscribeViewProps } from "./types";

export const UnsubscribeView = async ({ token }: UnsubscribeViewProps) => {
  const organisation = await requireCurrentOrganisation();
  return (
    <PageContainer width="narrow">
      <Card title={`Unsubscribe from ${organisation.name}`} description="You will no longer receive this newsletter.">
        {token ? <TokenUnsubscribeForm token={token} /> : <Notice tone="warning">This link is incomplete.</Notice>}
      </Card>
    </PageContainer>
  );
};
