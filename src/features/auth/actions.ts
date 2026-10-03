"use server";

import { redirect } from "next/navigation";
import { getCurrentOrganisation } from "@/entities/organisation/server";
import { sendSignInLink, signOutCurrentUser } from "@/shared/auth";
import { getEnv } from "@/shared/config";
import { emailBlindIndex } from "@/shared/crypto";
import { getDictionary } from "@/shared/i18n/server";
import { actionError, actionSuccess, emailSchema, type ActionState } from "@/shared/lib";
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

export const signOutAction = async (): Promise<void> => {
  await signOutCurrentUser();
  redirect("/");
};
