import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins/magic-link";
import { getEnv } from "@/shared/config/env";
import { account, getDb, session, user, verification } from "@/shared/db";
import { withEncryptedEmails } from "./encryptedAdapter";
import { sendMagicLinkEmail } from "./magicLinkEmail";

const MAGIC_LINK_TTL_SECONDS = 15 * 60;

const createAuth = () => {
  const env = getEnv();
  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    // Every tenant subdomain is its own origin; sessions are host-only cookies,
    // so signing in on one organisation never grants a session on another.
    baseURL: {
      allowedHosts: [env.APP_ROOT_DOMAIN, `*.${env.APP_ROOT_DOMAIN}`],
      protocol: env.APP_PROTOCOL,
    },
    database: withEncryptedEmails(
      drizzleAdapter(getDb(), {
        provider: "pg",
        schema: { user, session, account, verification },
      }),
    ),
    user: {
      additionalFields: {
        emailEncrypted: {
          type: "string",
          required: false,
          input: false,
          returned: false,
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
    plugins: [
      magicLink({
        expiresIn: MAGIC_LINK_TTL_SECONDS,
        storeToken: "hashed",
        sendMagicLink: ({ email, url, metadata }) =>
          sendMagicLinkEmail({ email, url, metadata }),
      }),
      // Must stay last: lets server actions set auth cookies.
      nextCookies(),
    ],
  });
};

export type Auth = ReturnType<typeof createAuth>;

let instance: Auth | undefined;

// Created lazily so importing this module never requires runtime secrets.
// Module-scoped (not on globalThis) so dev hot reloads pick up config changes.
export const getAuth = (): Auth => {
  if (!instance) {
    instance = createAuth();
  }
  return instance;
};
