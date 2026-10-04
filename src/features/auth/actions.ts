"use server";

import { getCurrentOrganisation } from "@/entities/organisation/server";
import { sendSignInLink, signInWithCode, signOutCurrentUser } from "@/shared/auth";
import { getEnv } from "@/shared/config";
import { emailBlindIndex } from "@/shared/crypto";
import { getDictionary } from "@/shared/i18n/server";
import {
  actionError,
  actionRedirect,
  actionSuccess,
  emailSchema,
  parseOneTimeCode,
  type ActionState,
} from "@/shared/lib";
import { allowRequest } from "@/shared/lib/server";

export const signInAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const t = await getDictionary();
  const parsed = emailSchema(t.common.invalidEmail).safeParse(formData.get("email"));
  if (!parsed.success) return actionError(t.common.invalidEmail);
  const email = parsed.data;

  if (!(await allowRequest("sign-in", emailBlindIndex(email)))) {
    return actionError(t.common.tooManyAttempts);
  }

  const organisation = await getCurrentOrganisation();
  if (organisation) {
    await sendSignInLink({ email, callbackPath: "/", organisationName: organisation.name });
    return actionSuccess(t.signIn.checkInbox);
  }

  // Root domain: only platform admins have anything to sign in to. Same response
  // either way so the form does not reveal who is an admin.
  if (getEnv().PLATFORM_ADMIN_EMAILS.includes(email)) {
    await sendSignInLink({ email, callbackPath: "/platform-admin" });
  }
  return actionSuccess(t.signIn.checkInbox);
};

// Second step of sign-in: the 6-digit code from the email. Signs in on the
// current device, which is what makes sign-in work inside the installed app.
export const verifySignInCodeAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const t = await getDictionary();
  const parsed = emailSchema(t.common.invalidEmail).safeParse(formData.get("email"));
  const code = parseOneTimeCode(formData.get("code"));
  if (!parsed.success) return actionError(t.common.invalidEmail);
  if (!code) return actionError(t.signIn.codeInvalid);
  const email = parsed.data;

  if (!(await allowRequest("sign-in-code", emailBlindIndex(email), { max: 10 }))) {
    return actionError(t.common.tooManyAttempts);
  }

  const result = await signInWithCode(email, code);
  if (result.status === "expired") return actionError(t.signIn.codeExpired);
  if (result.status === "locked") return actionError(t.signIn.codeLocked);
  if (result.status !== "ok") return actionError(t.signIn.codeInvalid);

  // Same destinations as the email link (see signInAction).
  const organisation = await getCurrentOrganisation();
  return actionRedirect(!organisation && getEnv().PLATFORM_ADMIN_EMAILS.includes(email) ? "/platform-admin" : "/");
};

// Returns where to go; the button does a full page load (see useFullPageRedirect).
export const signOutAction = async (): Promise<string> => {
  await signOutCurrentUser();
  return "/";
};
