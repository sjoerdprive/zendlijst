import { MAX_WRITERS } from "@/entities/membership";
import { listMembers } from "@/entities/membership/server";
import { WriterList } from "@/features/manage-writers";
import { getDictionary } from "@/shared/i18n/server";
import { Card } from "@/shared/ui";
import { TeamShell } from "@/widgets/team-shell";
import { requireTeamAccess } from "@/widgets/team-shell/server";

export const TeamWritersView = async () => {
  const { organisation, role } = await requireTeamAccess(["admin"]);
  const [team, t] = await Promise.all([listMembers(organisation.id, ["admin", "writer"]), getDictionary()]);
  return (
    <TeamShell role={role} title={t.writers.title} description={t.writers.description(MAX_WRITERS)}>
      <Card>
        <WriterList
          admin={team.find((member) => member.role === "admin") ?? null}
          writers={team.filter((member) => member.role === "writer")}
        />
      </Card>
    </TeamShell>
  );
};
