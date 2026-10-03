import { getViewer } from "@/entities/membership/server";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { PageContainer } from "@/shared/ui";
import { HomeContent } from "./HomeContent";
import { HomeNotices } from "./HomeNotices";
import type { TenantHomeViewProps } from "./types";

export const TenantHomeView = async ({ flags }: TenantHomeViewProps) => {
  const organisation = await requireCurrentOrganisation();
  const viewer = await getViewer(organisation.id);
  return (
    <PageContainer>
      <div className="space-y-6">
        <HomeNotices flags={flags} />
        <HomeContent organisation={organisation} viewer={viewer} />
      </div>
    </PageContainer>
  );
};
