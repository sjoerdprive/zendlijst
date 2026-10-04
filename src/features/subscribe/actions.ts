"use server";

import { z } from "zod";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { getSessionUser, sendSignInLink, signInWithCode } from "@/shared/auth";
import { emailBlindIndex } from "@/shared/crypto";
import type { Dictionary } from "@/shared/i18n";
import { getDictionary } from "@/shared/i18n/server";
import {
  actionError,
  actionSuccess,
  emailSchema,
  actionRedirect,
  fieldErrors,
  parseOneTimeCode,
  type ActionState,
} from "@/shared/lib";
import { allowRequest } from "@/shared/lib/server";
import { homeQueryFor, joinOrganisation } from "./join";
import { createSubscribeToken } from "./utils";

const subscribeSchema = (t: Dictionary) =>
  z.object({
    email: emailSchema(t.common.invalidEmail),
    notify: z.literal("on").optional(),
  });

export const subscribeAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const t = await getDictionary();
  const organisation = await requireCurrentOrganisation();
  if (organisation.subscriptionMode === "closed") return actionError(t.subscribe.closed);

  const parsed = subscribeSchema(t).safeParse({
    email: formData.get("email"),
    notify: formData.get("notify") ?? undefined,
  });
  if (!parsed.success) {
    return actionError(t.common.checkForm, fieldErrors(parsed.error));
  }
  const { email } = parsed.data;
  const notify = parsed.data.notify === "on";

  if (!(await allowRequest("subscribe", emailBlindIndex(email)))) {
    return actionError(t.common.tooManyAttempts);
  }

  const params = new URLSearchParams({
    notify: notify ? "1" : "0",
    token: createSubscribeToken(email, notify),
  });
  await sendSignInLink({
    email,
    callbackPath: `/subscribe/confirm?${params.toString()}`,
    organisationName: organisation.name,
  });
  return actionSuccess(
    organisation.subscriptionMode === "approval" ? t.subscribe.successApproval : t.subscribe.success,
  );
};

// Confirms a subscription with the 6-digit code from the email instead of the
// link, so it also works inside the installed app. The code proves ownership
// of the address, so it replaces the link's subscribe token.
export const subscribeWithCodeAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const t = await getDictionary();
  const organisation = await requireCurrentOrganisation();
  if (organisation.subscriptionMode === "closed") return actionError(t.subscribe.closed);

  const parsed = emailSchema(t.common.invalidEmail).safeParse(formData.get("email"));
  const code = parseOneTimeCode(formData.get("code"));
  if (!parsed.success) return actionError(t.common.invalidEmail);
  if (!code) return actionError(t.signIn.codeInvalid);

  if (!(await allowRequest("subscribe-code", emailBlindIndex(parsed.data), { max: 10 }))) {
    return actionError(t.common.tooManyAttempts);
  }

  const result = await signInWithCode(parsed.data, code);
  if (result.status === "expired") return actionError(t.signIn.codeExpired);
  if (result.status === "locked") return actionError(t.signIn.codeLocked);
  if (result.status !== "ok") return actionError(t.signIn.codeInvalid);

  const joined = await joinOrganisation(organisation, result.userId, formData.get("notify") === "1");
  return actionRedirect(`/?${homeQueryFor(joined)}`);
};

// For visitors who are already signed in (their email is verified) but are not
// subscribed to this organisation yet.
// Returns where to go; the button does a full page load (see useFullPageRedirect).
export const subscribeSignedInAction = async (formData: FormData): Promise<string> => {
  const organisation = await requireCurrentOrganisation();
  const sessionUser = await getSessionUser();
  if (!sessionUser) return "/sign-in";
  const result = await joinOrganisation(organisation, sessionUser.id, formData.get("notify") === "on");
  return `/?${homeQueryFor(result)}`;
};
