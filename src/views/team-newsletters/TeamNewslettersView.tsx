import { getDeliveryStats } from "@/entities/delivery/server";
import { listAllNewsletters } from "@/entities/newsletter/server";
import { NewsletterTable, UploadNewsletterForm, type NewsletterRow } from "@/features/publish-newsletter";
import { Card } from "@/shared/ui";
import { TeamShell } from "@/widgets/team-shell";
import { requireTeamAccess } from "@/widgets/team-shell/server";

export const TeamNewslettersView = async () => {
  const { organisation, role } = await requireTeamAccess();
  const [newsletters, stats] = await Promise.all([
    listAllNewsletters(organisation.id),
    getDeliveryStats(organisation.id),
  ]);
  const rows: NewsletterRow[] = newsletters.map((newsletter) => ({
    newsletter,
    stats: stats[newsletter.id] ?? null,
  }));

  return (
    <TeamShell role={role} title="Newsletters" description="Upload a new issue and choose when it goes out.">
      <Card title="Upload a newsletter">
        <UploadNewsletterForm />
      </Card>
      <Card title="All newsletters">
        <NewsletterTable rows={rows} />
      </Card>
    </TeamShell>
  );
};
