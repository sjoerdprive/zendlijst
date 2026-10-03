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
