"use server";

import { redirect } from "next/navigation";
import { getCurrentOrganisation } from "@/entities/organisation/server";
import { sendSignInLink, signOutCurrentUser } from "@/shared/auth";
import { getEnv } from "@/shared/config";
import { emailBlindIndex } from "@/shared/crypto";
import { actionError, actionSuccess, emailSchema, type ActionState } from "@/shared/lib";
import { allowRequest } from "@/shared/lib/server";

const CHECK_INBOX =
  "If that address can sign in here, a sign-in link is on its way. Check your inbox.";

export const signInAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return actionError("Enter a valid email address.");
  const email = parsed.data;

  if (!(await allowRequest("sign-in", emailBlindIndex(email)))) {
    return actionError("Too many attempts. Please wait a few minutes and try again.");
  }

  const organisation = await getCurrentOrganisation();
  if (organisation) {
    await sendSignInLink({ email, callbackPath: "/", organisationName: organisation.name });
    return actionSuccess(CHECK_INBOX);
  }

  // Root domain: only platform admins have anything to sign in to. Same response
  // either way so the form does not reveal who is an admin.
  if (getEnv().PLATFORM_ADMIN_EMAILS.includes(email)) {
    await sendSignInLink({ email, callbackPath: "/platform-admin" });
  }
  return actionSuccess(CHECK_INBOX);
};

export const signOutAction = async (): Promise<void> => {
  await signOutCurrentUser();
  redirect("/");
};
