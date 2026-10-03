import { notFound, redirect } from "next/navigation";
import { listOrganisationRequests } from "@/entities/organisation/server";
import { RequestReviewList } from "@/features/review-organisation-requests";
import { getSessionUser, isPlatformAdmin } from "@/shared/auth";
import { getEnv } from "@/shared/config";
import { Card, PageContainer } from "@/shared/ui";

export const PlatformAdminView = async () => {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/sign-in");
  if (!isPlatformAdmin(sessionUser)) notFound();
  const requests = await listOrganisationRequests();
  return (
    <PageContainer>
      <Card title="Organisation requests" description="Approving creates the subdomain and emails the admin a sign-in link.">
        <RequestReviewList requests={requests} rootDomain={getEnv().APP_ROOT_DOMAIN} />
      </Card>
    </PageContainer>
  );
};
