import { getSessionUser, isPlatformAdmin } from "@/shared/auth";
import { SignOutButton } from "@/features/auth";
import { SiteHeader } from "./SiteHeader";

export const PlatformHeader = async () => {
  const isAdmin = isPlatformAdmin(await getSessionUser());
  return (
    <SiteHeader
      brand="Nieuwsbrief"
      links={isAdmin ? [{ href: "/platform-admin", label: "Requests" }] : []}
      trailing={isAdmin ? <SignOutButton /> : undefined}
    />
  );
};
