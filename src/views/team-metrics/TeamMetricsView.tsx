import { getDeliveryStats } from "@/entities/delivery/server";
import { listMembers } from "@/entities/membership/server";
import { isPublished, publishedAt } from "@/entities/newsletter";
import { countNewsletterReads, listAllNewsletters } from "@/entities/newsletter/server";
import { getDictionary, getLocale } from "@/shared/i18n/server";
import { formatPercent } from "@/shared/lib";
import { Card, EmptyState, StatTile } from "@/shared/ui";
import { TeamShell } from "@/widgets/team-shell";
import { requireTeamAccess } from "@/widgets/team-shell/server";
import { MetricsTable } from "./MetricsTable";
import type { IssueMetrics } from "./types";

export const TeamMetricsView = async () => {
  const { organisation, role } = await requireTeamAccess();
  const [newsletters, stats, reads, members, t, locale] = await Promise.all([
    listAllNewsletters(organisation.id),
    getDeliveryStats(organisation.id),
    countNewsletterReads(organisation.id),
    listMembers(organisation.id, ["admin", "writer", "subscriber"]),
    getDictionary(),
    getLocale(),
  ]);

  const issues: IssueMetrics[] = newsletters
    .filter((newsletter) => isPublished(newsletter.status))
    .sort((a, b) => (publishedAt(b)?.getTime() ?? 0) - (publishedAt(a)?.getTime() ?? 0))
    .map((newsletter) => ({
      newsletter,
      stats: stats[newsletter.id] ?? null,
      readers: reads[newsletter.id] ?? 0,
    }));

  const sent = issues.reduce((total, issue) => total + (issue.stats?.sent ?? 0), 0);
  const failed = issues.reduce((total, issue) => total + (issue.stats?.failed ?? 0), 0);
  const optedIn = members.filter((member) => member.emailNotifications).length;
  const averageReaders = issues.length
    ? issues.reduce((total, issue) => total + issue.readers, 0) / issues.length
    : 0;

  return (
    <TeamShell role={role} title={t.metrics.title} description={t.metrics.description}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile tone="brand" label={t.metrics.members} value={String(members.length)} hint={t.metrics.membersHint(optedIn)} />
        <StatTile tone="accent" label={t.metrics.issues} value={String(issues.length)} />
        <StatTile
          label={t.metrics.delivered}
          value={sent + failed > 0 ? formatPercent(sent / (sent + failed), locale) : "—"}
          hint={sent + failed > 0 ? t.metrics.deliveredHint(sent, sent + failed) : undefined}
        />
        <StatTile
          label={t.metrics.readers}
          value={issues.length ? String(Math.round(averageReaders)) : "—"}
          hint={
            issues.length && members.length
              ? t.metrics.readersHint(formatPercent(averageReaders / members.length, locale))
              : undefined
          }
        />
      </div>
      <Card title={t.metrics.tableTitle}>
        {issues.length === 0 ? (
          <EmptyState title={t.metrics.emptyTitle}>{t.metrics.emptyBody}</EmptyState>
        ) : (
          <div className="space-y-4">
            <MetricsTable issues={issues} />
            <p className="text-xs text-muted">{t.metrics.note}</p>
          </div>
        )}
      </Card>
    </TeamShell>
  );
};
