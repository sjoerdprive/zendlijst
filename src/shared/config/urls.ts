import "server-only";
import { getEnv } from "./env";

export const rootUrl = (path = "/"): string => {
  const env = getEnv();
  return new URL(path, `${env.APP_PROTOCOL}://${env.APP_ROOT_DOMAIN}`).toString();
};

export const organisationUrl = (slug: string, path = "/"): string => {
  const env = getEnv();
  return new URL(
    path,
    `${env.APP_PROTOCOL}://${slug}.${env.APP_ROOT_DOMAIN}`,
  ).toString();
};

// Domain for cookies that should follow the visitor across tenant subdomains
// (e.g. the language preference). Hosts without a dot, like "localhost",
// cannot carry a Domain attribute, so those cookies stay host-only.
export const sharedCookieDomain = (): string | undefined => {
  const host = getEnv().APP_ROOT_DOMAIN.split(":")[0] ?? "";
  return host.includes(".") ? host : undefined;
};
