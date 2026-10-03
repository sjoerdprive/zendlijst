import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isTeamRole } from "@/entities/membership";
import { getViewer } from "@/entities/membership/server";
import { isPublished, NewsletterStatusBadge, publishedAt } from "@/entities/newsletter";
import { getNewsletter } from "@/entities/newsletter/server";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { NewsletterViewer } from "@/features/read-newsletter";
import { getDictionary, getLocale } from "@/shared/i18n/server";
import { formatDate } from "@/shared/lib";
import { PageContainer } from "@/shared/ui";
import type { NewsletterViewProps } from "./types";

export const NewsletterPageView = async ({ newsletterId }: NewsletterViewProps) => {
  const organisation = await requireCurrentOrganisation();
  const viewer = await getViewer(organisation.id);
  if (!viewer) redirect("/sign-in");
  if (!viewer.membership) redirect("/");

  const [newsletter, t, locale] = await Promise.all([
    getNewsletter(organisation.id, newsletterId),
    getDictionary(),
    getLocale(),
  ]);
  const canPreview = isTeamRole(viewer.membership.role);
  if (!newsletter || (!isPublished(newsletter.status) && !canPreview)) notFound();

  const date = publishedAt(newsletter);
  return (
    <PageContainer>
      <div className="space-y-6">
        <Link href="/" className="text-sm font-medium text-muted hover:text-brand">
          {t.newsletterPage.back}
        </Link>
        <header className="space-y-2 border-l-4 border-accent pl-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent-ink">
            {date && <span>{formatDate(date, locale)}</span>}
            {!isPublished(newsletter.status) && <NewsletterStatusBadge status={newsletter.status} />}
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">{newsletter.title}</h1>
          {newsletter.summary && <p className="text-muted">{newsletter.summary}</p>}
        </header>
        <NewsletterViewer newsletter={newsletter} />
      </div>
    </PageContainer>
  );
};
