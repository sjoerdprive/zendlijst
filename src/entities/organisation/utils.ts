import type { SubscriptionMode } from "./types";

export const SUBSCRIPTION_MODES: SubscriptionMode[] = ["open", "approval", "closed"];

export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])$/;

// Subdomains we keep for the platform itself.
export const RESERVED_SLUGS = new Set([
  "www",
  "app",
  "api",
  "admin",
  "mail",
  "static",
  "assets",
  "status",
  "help",
  "support",
]);

export const isValidSlug = (slug: string): boolean =>
  SLUG_PATTERN.test(slug) && !RESERVED_SLUGS.has(slug);

export const slugify = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);

// Extracts the tenant slug from a Host header, e.g. "acme.example.com" -> "acme".
export const slugFromHost = (host: string, rootDomain: string): string | null => {
  const normalizedHost = host.toLowerCase();
  const suffix = `.${rootDomain.toLowerCase()}`;
  if (!normalizedHost.endsWith(suffix)) return null;
  const subdomain = normalizedHost.slice(0, -suffix.length);
  return subdomain && !subdomain.includes(".") ? subdomain : null;
};
