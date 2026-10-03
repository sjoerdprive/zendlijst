import { redirect } from "next/navigation";
import { getViewer } from "@/entities/membership/server";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { NotificationToggle, UnsubscribeButton } from "@/features/manage-subscription";
import { getDictionary } from "@/shared/i18n/server";
import { Card, PageContainer } from "@/shared/ui";

export const SettingsView = async () => {
  const organisation = await requireCurrentOrganisation();
  const [viewer, t] = await Promise.all([getViewer(organisation.id), getDictionary()]);
  if (!viewer) redirect("/sign-in");
  if (!viewer.membership) redirect("/");
  const isAdmin = viewer.membership.role === "admin";

  return (
    <PageContainer width="narrow">
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">{t.settings.title}</h1>
        <Card title={t.settings.subscriptionTitle} description={t.settings.signedInAs(viewer.email)}>
          <NotificationToggle enabled={viewer.membership.emailNotifications} />
        </Card>
        <Card
          title={t.settings.unsubscribeTitle}
          description={isAdmin ? t.settings.adminCannotLeave : t.settings.leaveDescription(organisation.name)}
        >
          {!isAdmin && <UnsubscribeButton />}
        </Card>
      </div>
    </PageContainer>
  );
};
