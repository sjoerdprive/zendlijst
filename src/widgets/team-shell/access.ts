import "server-only";
import { notFound, redirect } from "next/navigation";
import { isTeamRole, type Membership, type TeamRole } from "@/entities/membership";
import { getViewer } from "@/entities/membership/server";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import type { Organisation } from "@/entities/organisation";

interface TeamAccess {
  organisation: Organisation;
  membership: Membership;
  role: TeamRole;
}

// Page-level guard for the team area. Server actions re-check on their own.
export const requireTeamAccess = async (
  roles: TeamRole[] = ["admin", "writer"],
): Promise<TeamAccess> => {
  const organisation = await requireCurrentOrganisation();
  const viewer = await getViewer(organisation.id);
  if (!viewer) redirect("/sign-in");
  const role = viewer.membership?.role;
  if (!viewer.membership || !isTeamRole(role) || !roles.includes(role)) notFound();
  return { organisation, membership: viewer.membership, role };
};
