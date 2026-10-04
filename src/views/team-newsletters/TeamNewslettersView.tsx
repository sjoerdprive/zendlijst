import { getDeliveryStats } from "@/entities/delivery/server";
import { earliestDeliveryDate } from "@/entities/newsletter";
import { listAllNewsletters } from "@/entities/newsletter/server";
import { NewsletterTable, UploadNewsletterForm, type NewsletterRow } from "@/features/publish-newsletter";
import { getDictionary } from "@/shared/i18n/server";
import { Card } from "@/shared/ui";
import { TeamShell } from "@/widgets/team-shell";
import { requireTeamAccess } from "@/widgets/team-shell/server";

export const TeamNewslettersView = async () => {
  const { organisation, role } = await requireTeamAccess();
  const [newsletters, stats, t] = await Promise.all([
    listAllNewsletters(organisation.id),
    getDeliveryStats(organisation.id),
    getDictionary(),
  ]);
  const earliestDate = earliestDeliveryDate();
  const rows: NewsletterRow[] = newsletters.map((newsletter) => ({
    newsletter,
    stats: stats[newsletter.id] ?? null,
  }));

  return (
    <TeamShell role={role} title={t.newsletters.title} description={t.newsletters.description}>
      <Card title={t.newsletters.uploadTitle}>
        <UploadNewsletterForm earliestDate={earliestDate} />
      </Card>
      <Card title={t.newsletters.allTitle}>
        <NewsletterTable rows={rows} earliestDate={earliestDate} />
      </Card>
    </TeamShell>
  );
};
