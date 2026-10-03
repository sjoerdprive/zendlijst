import { listMembers } from "@/entities/membership/server";
import { AddSubscriberForm, SubscriberTable } from "@/features/manage-subscribers";
import { getDictionary } from "@/shared/i18n/server";
import { Card } from "@/shared/ui";
import { TeamShell } from "@/widgets/team-shell";
import { requireTeamAccess } from "@/widgets/team-shell/server";

export const TeamSubscribersView = async () => {
  const { organisation, role } = await requireTeamAccess(["admin"]);
  const [members, t] = await Promise.all([
    listMembers(organisation.id, ["admin", "writer", "subscriber"]),
    getDictionary(),
  ]);
  return (
    <TeamShell role={role} title={t.subscribers.title} description={t.subscribers.description}>
      <Card title={t.subscribers.addTitle}>
        <AddSubscriberForm />
      </Card>
      <Card title={t.subscribers.listTitle}>
        <SubscriberTable members={members} />
      </Card>
    </TeamShell>
  );
};
