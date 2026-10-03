import { JoinAsSignedInUser } from "@/features/subscribe";
import { getDictionary } from "@/shared/i18n/server";
import { Card } from "@/shared/ui";
import type { OrganisationIntroProps } from "./types";

export const JoinHome = async ({ organisation }: OrganisationIntroProps) => {
  const t = await getDictionary();
  return (
    <div className="mx-auto max-w-xl">
      <Card title={t.tenantHome.joinTitle(organisation.name)} description={t.tenantHome.joinDescription} className="border-t-4 border-t-brand">
        <JoinAsSignedInUser />
      </Card>
    </div>
  );
};
