import { isTeamRole } from "@/entities/membership";
import { getViewer } from "@/entities/membership/server";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { SignOutButton } from "@/features/auth";
import { getDictionary } from "@/shared/i18n/server";
import { SiteHeader } from "./SiteHeader";
import type { SiteHeaderLink } from "./types";

export const TenantHeader = async () => {
  const organisation = await requireCurrentOrganisation();
  const [viewer, t] = await Promise.all([getViewer(organisation.id), getDictionary()]);
  const membership = viewer?.membership;

  const links: SiteHeaderLink[] = [{ href: "/", label: t.header.archive }];
  if (membership) links.push({ href: "/settings", label: t.header.settings });
  if (isTeamRole(membership?.role)) links.push({ href: "/team", label: t.header.team });
  if (!viewer) links.push({ href: "/sign-in", label: t.header.signIn });

  return <SiteHeader brand={organisation.name} links={links} trailing={viewer ? <SignOutButton /> : undefined} />;
};
