import { listMembers } from "@/entities/membership/server";
import { AddSubscriberForm, SubscriberTable } from "@/features/manage-subscribers";
import { Card } from "@/shared/ui";
import { TeamShell } from "@/widgets/team-shell";
import { requireTeamAccess } from "@/widgets/team-shell/server";

export const TeamSubscribersView = async () => {
  const { organisation, role } = await requireTeamAccess(["admin"]);
  const members = await listMembers(organisation.id, ["admin", "writer", "subscriber"]);
  return (
    <TeamShell role={role} title="Subscribers" description="Addresses are stored encrypted and only decrypted for this view and for sending.">
      <Card title="Add a subscriber">
        <AddSubscriberForm />
      </Card>
      <Card title="Everyone on the list">
        <SubscriberTable members={members} />
      </Card>
    </TeamShell>
  );
};
