import { getSessionUser, isPlatformAdmin } from "@/shared/auth";
import { SignOutButton } from "@/features/auth";
import { getDictionary } from "@/shared/i18n/server";
import { SiteHeader } from "./SiteHeader";

export const PlatformHeader = async () => {
  const [sessionUser, t] = await Promise.all([getSessionUser(), getDictionary()]);
  const isAdmin = isPlatformAdmin(sessionUser);
  return (
    <SiteHeader
      brand="Nieuwsbrief"
      links={isAdmin ? [{ href: "/platform-admin", label: t.header.requests }] : []}
      trailing={isAdmin ? <SignOutButton /> : undefined}
    />
  );
};
