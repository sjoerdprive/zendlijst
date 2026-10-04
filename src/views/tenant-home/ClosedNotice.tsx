import { getDictionary } from "@/shared/i18n/server";
import { Notice } from "@/shared/ui";
import type { OrganisationIntroProps } from "./types";

export const ClosedNotice = async ({ organisation }: OrganisationIntroProps) => {
  const t = await getDictionary();
  return (
    <Notice tone="info" title={t.tenantHome.closedTitle}>
      {t.tenantHome.closedBody(organisation.name)}
    </Notice>
  );
};
