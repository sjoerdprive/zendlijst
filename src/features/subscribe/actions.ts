"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { ensureSubscription } from "@/entities/membership/server";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { getSessionUser, sendSignInLink } from "@/shared/auth";
import { emailBlindIndex } from "@/shared/crypto";
import {
  actionError,
  actionSuccess,
  emailSchema,
  fieldErrors,
  type ActionState,
} from "@/shared/lib";
import { allowRequest } from "@/shared/lib/server";
import { createSubscribeToken } from "./utils";

const subscribeSchema = z.object({
  email: emailSchema,
  notify: z.literal("on").optional(),
});

export const subscribeAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const parsed = subscribeSchema.safeParse({
    email: formData.get("email"),
    notify: formData.get("notify") ?? undefined,
  });
  if (!parsed.success) {
    return actionError("Please check the form.", fieldErrors(parsed.error));
  }
  const { email } = parsed.data;
  const notify = parsed.data.notify === "on";

  if (!(await allowRequest("subscribe", emailBlindIndex(email)))) {
    return actionError("Too many attempts. Please wait a few minutes and try again.");
  }

  const organisation = await requireCurrentOrganisation();
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
    "Almost there! We sent you an email. Click the link inside to confirm your subscription.",
  );
};

// For visitors who are already signed in (their email is verified) but are not
// subscribed to this organisation yet.
export const subscribeSignedInAction = async (formData: FormData): Promise<void> => {
  const organisation = await requireCurrentOrganisation();
  const sessionUser = await getSessionUser();
  if (!sessionUser) return;
  await ensureSubscription(organisation.id, sessionUser.id, formData.get("notify") === "on");
  refresh();
};
