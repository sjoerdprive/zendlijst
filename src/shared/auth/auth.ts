import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { emailOTP } from "better-auth/plugins/email-otp";
import { magicLink } from "better-auth/plugins/magic-link";
import { getEnv } from "@/shared/config/env";
import { hashIdentifier } from "@/shared/crypto";
import { account, getDb, session, user, verification } from "@/shared/db";
import { withEncryptedEmails } from "./encryptedAdapter";
import { sendMagicLinkEmail } from "./magicLinkEmail";

const MAGIC_LINK_TTL_SECONDS = 15 * 60;

// Sign-in codes are only checked through our own server actions (which are
// rate limited), so every public email-OTP route is switched off.
const DISABLED_OTP_PATHS = [
  "/sign-in/email-otp",
  "/forget-password/email-otp",
  "/email-otp/send-verification-otp",
  "/email-otp/check-verification-otp",
  "/email-otp/verify-email",
  "/email-otp/request-password-reset",
  "/email-otp/reset-password",
  "/email-otp/request-email-change",
  "/email-otp/change-email",
];

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
    disabledPaths: DISABLED_OTP_PATHS,
    verification: {
      // The OTP plugin keys codes by "sign-in-otp-<email>"; store a keyed hash
      // instead so no plaintext address ends up in the verification table.
      storeIdentifier: {
        default: "plain",
        overrides: { "sign-in-otp-": { hash: async (identifier) => hashIdentifier(identifier) } },
      },
    },
    plugins: [
      magicLink({
        expiresIn: MAGIC_LINK_TTL_SECONDS,
        storeToken: "hashed",
        // One email carries both the link and a 6-digit code. The code lets
        // people sign in inside the installed app, which has its own cookies
        // and would otherwise open the link in the browser.
        sendMagicLink: async ({ email, url, metadata }) => {
          // Always runs inside a request (server action or auth route), whose
          // host resolves the dynamic baseURL.
          const code = await getAuth().api.createVerificationOTP({
            headers: await headers(),
            body: { email, type: "sign-in" },
          });
          await sendMagicLinkEmail({ email, url, code, metadata });
        },
      }),
      emailOTP({
        otpLength: 6,
        expiresIn: MAGIC_LINK_TTL_SECONDS,
        storeOTP: "hashed",
        allowedAttempts: 5,
        // Codes are created and emailed by the magic-link callback above.
        sendVerificationOTP: async () => {},
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
