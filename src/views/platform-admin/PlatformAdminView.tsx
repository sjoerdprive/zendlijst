import { notFound, redirect } from "next/navigation";
import { listOrganisationRequests } from "@/entities/organisation/server";
import { RequestReviewList } from "@/features/review-organisation-requests";
import { getSessionUser, isPlatformAdmin } from "@/shared/auth";
import { getEnv } from "@/shared/config";
import { getDictionary } from "@/shared/i18n/server";
import { Card, PageContainer } from "@/shared/ui";

export const PlatformAdminView = async () => {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/sign-in");
  if (!isPlatformAdmin(sessionUser)) notFound();
  const [requests, t] = await Promise.all([listOrganisationRequests(), getDictionary()]);
  return (
    <PageContainer>
      <Card title={t.platformAdmin.title} description={t.platformAdmin.description}>
        <RequestReviewList requests={requests} rootDomain={getEnv().APP_ROOT_DOMAIN} />
      </Card>
    </PageContainer>
  );
};
