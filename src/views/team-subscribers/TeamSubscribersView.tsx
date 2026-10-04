import { listMembers, listSubscriptionRequests } from "@/entities/membership/server";
import { AddSubscriberForm, SubscriberTable, SubscriptionRequestList } from "@/features/manage-subscribers";
import { getDictionary } from "@/shared/i18n/server";
import { Card } from "@/shared/ui";
import { TeamShell } from "@/widgets/team-shell";
import { requireTeamAccess } from "@/widgets/team-shell/server";

export const TeamSubscribersView = async () => {
  const { organisation, role } = await requireTeamAccess(["admin"]);
  const [members, requests, t] = await Promise.all([
    listMembers(organisation.id, ["admin", "writer", "subscriber"]),
    listSubscriptionRequests(organisation.id),
    getDictionary(),
  ]);
  return (
    <TeamShell role={role} title={t.subscribers.title} description={t.subscribers.description}>
      {(requests.length > 0 || organisation.subscriptionMode === "approval") && (
        <div id="requests" className="scroll-mt-24">
          <Card title={t.requests.title} description={t.requests.description} className="border-t-4 border-t-accent">
            <SubscriptionRequestList requests={requests} />
          </Card>
        </div>
      )}
      <Card title={t.subscribers.addTitle}>
        <AddSubscriberForm />
      </Card>
      <Card title={t.subscribers.listTitle}>
        <SubscriberTable members={members} />
      </Card>
    </TeamShell>
  );
};
