import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isTeamRole } from "@/entities/membership";
import { getViewer } from "@/entities/membership/server";
import { isPublished, NewsletterStatusBadge, publishedAt } from "@/entities/newsletter";
import { getNewsletter } from "@/entities/newsletter/server";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { NewsletterViewer } from "@/features/read-newsletter";
import { formatDate } from "@/shared/lib";
import { PageContainer } from "@/shared/ui";
import type { NewsletterViewProps } from "./types";

export const NewsletterPageView = async ({ newsletterId }: NewsletterViewProps) => {
  const organisation = await requireCurrentOrganisation();
  const viewer = await getViewer(organisation.id);
  if (!viewer) redirect("/sign-in");
  if (!viewer.membership) redirect("/");

  const newsletter = await getNewsletter(organisation.id, newsletterId);
  const canPreview = isTeamRole(viewer.membership.role);
  if (!newsletter || (!isPublished(newsletter.status) && !canPreview)) notFound();

  const date = publishedAt(newsletter);
  return (
    <PageContainer>
      <div className="space-y-6">
        <Link href="/" className="text-sm text-zinc-500 hover:underline">
          ← Back to archive
        </Link>
        <header className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            {date && <span>{formatDate(date)}</span>}
            {!isPublished(newsletter.status) && <NewsletterStatusBadge status={newsletter.status} />}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{newsletter.title}</h1>
          {newsletter.summary && <p className="text-zinc-600 dark:text-zinc-400">{newsletter.summary}</p>}
        </header>
        <NewsletterViewer newsletter={newsletter} />
      </div>
    </PageContainer>
  );
};
