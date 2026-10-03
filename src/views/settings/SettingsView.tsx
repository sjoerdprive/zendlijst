import { redirect } from "next/navigation";
import { getViewer } from "@/entities/membership/server";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { NotificationToggle, UnsubscribeButton } from "@/features/manage-subscription";
import { Card, PageContainer } from "@/shared/ui";

export const SettingsView = async () => {
  const organisation = await requireCurrentOrganisation();
  const viewer = await getViewer(organisation.id);
  if (!viewer) redirect("/sign-in");
  if (!viewer.membership) redirect("/");
  const isAdmin = viewer.membership.role === "admin";

  return (
    <PageContainer width="narrow">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <Card title="Your subscription" description={`Signed in as ${viewer.email}`}>
          <NotificationToggle enabled={viewer.membership.emailNotifications} />
        </Card>
        <Card
          title="Unsubscribe"
          description={
            isAdmin
              ? "As the organisation admin you cannot leave. Turn off email notifications instead."
              : `Stop following ${organisation.name}. You will lose access to the archive.`
          }
        >
          {!isAdmin && <UnsubscribeButton />}
        </Card>
      </div>
    </PageContainer>
  );
};
