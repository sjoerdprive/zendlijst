import { isTeamRole } from "@/entities/membership";
import { getViewer } from "@/entities/membership/server";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { SignOutButton } from "@/features/auth";
import { SiteHeader } from "./SiteHeader";
import type { SiteHeaderLink } from "./types";

export const TenantHeader = async () => {
  const organisation = await requireCurrentOrganisation();
  const viewer = await getViewer(organisation.id);
  const membership = viewer?.membership;

  const links: SiteHeaderLink[] = [{ href: "/", label: "Archive" }];
  if (membership) links.push({ href: "/settings", label: "Settings" });
  if (isTeamRole(membership?.role)) links.push({ href: "/team", label: "Team" });
  if (!viewer) links.push({ href: "/sign-in", label: "Sign in" });

  return <SiteHeader brand={organisation.name} links={links} trailing={viewer ? <SignOutButton /> : undefined} />;
};
