"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { getSessionUser, sendSignInLink } from "@/shared/auth";
import { emailBlindIndex } from "@/shared/crypto";
import type { Dictionary } from "@/shared/i18n";
import { getDictionary } from "@/shared/i18n/server";
import {
  actionError,
  actionSuccess,
  emailSchema,
  fieldErrors,
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

// For visitors who are already signed in (their email is verified) but are not
// subscribed to this organisation yet.
export const subscribeSignedInAction = async (formData: FormData): Promise<void> => {
  const organisation = await requireCurrentOrganisation();
  const sessionUser = await getSessionUser();
  if (!sessionUser) return;
  const result = await joinOrganisation(organisation, sessionUser.id, formData.get("notify") === "on");
  if (result !== "joined") redirect(`/?${homeQueryFor(result)}`);
  refresh();
};
