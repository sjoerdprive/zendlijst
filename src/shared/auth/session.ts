import "server-only";
import { headers } from "next/headers";
import { cache } from "react";
import { normalizeEmail } from "@/shared/crypto";
import { getAuth } from "./auth";
import type { SessionUser } from "./types";

// Deduplicated per request; safe to call from any server component or action.
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const result = await getAuth().api.getSession({ headers: await headers() });
  if (!result) return null;
  return {
    id: result.user.id,
    email: result.user.email,
    name: result.user.name,
  };
});

// Used when admins add writers/subscribers by hand or approve an organisation:
// goes through better-auth's adapter so the email is encrypted consistently.
export const findOrCreateUserByEmail = async (email: string): Promise<string> => {
  const normalized = normalizeEmail(email);
  const context = await getAuth().$context;
  const existing = await context.internalAdapter.findUserByEmail(normalized);
  if (existing) return existing.user.id;
  const created = await context.internalAdapter.createUser(
    { email: normalized, name: "", emailVerified: false },
    { method: "admin" },
  );
  return created.id;
};

export const sendSignInLink = async (input: {
  email: string;
  callbackPath: string;
  organisationName?: string;
}): Promise<void> => {
  await getAuth().api.signInMagicLink({
    headers: await headers(),
    body: {
      email: normalizeEmail(input.email),
      callbackURL: input.callbackPath,
      errorCallbackURL: "/sign-in?error=link",
      metadata: input.organisationName
        ? { organisationName: input.organisationName }
        : undefined,
    },
  });
};

export const signOutCurrentUser = async (): Promise<void> => {
  await getAuth().api.signOut({ headers: await headers() });
};
