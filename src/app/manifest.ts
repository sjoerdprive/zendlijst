import type { MetadataRoute } from "next";
import { getCurrentOrganisation } from "@/entities/organisation/server";
import { getDictionary, getLocale } from "@/shared/i18n/server";

// Per host: on <slug>.zendlijst.nl the installed app is named after that
// organisation and opens its archive; on the root domain it is Zendlijst.
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [organisation, t, locale] = await Promise.all([getCurrentOrganisation(), getDictionary(), getLocale()]);
  const name = organisation?.name ?? t.meta.title;
  return {
    id: "/",
    name,
    short_name: name.length > 12 ? name.slice(0, 12).trim() : name,
    description: t.meta.description,
    lang: locale,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#faf6ee",
    theme_color: "#2b44b8",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
