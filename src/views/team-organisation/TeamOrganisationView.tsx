import { SubscriptionModeForm } from "@/features/organisation-settings";
import { getDictionary } from "@/shared/i18n/server";
import { Card } from "@/shared/ui";
import { TeamShell } from "@/widgets/team-shell";
import { requireTeamAccess } from "@/widgets/team-shell/server";

export const TeamOrganisationView = async () => {
  const { organisation, role } = await requireTeamAccess(["admin"]);
  const t = await getDictionary();
  return (
    <TeamShell role={role} title={t.organisationSettings.title} description={t.organisationSettings.description}>
      <Card title={t.organisationSettings.modeTitle} description={t.organisationSettings.modeDescription}>
        <SubscriptionModeForm mode={organisation.subscriptionMode} />
      </Card>
    </TeamShell>
  );
};
