"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { authorizeMember } from "@/entities/membership/server";
import { SUBSCRIPTION_MODES } from "@/entities/organisation";
import { requireCurrentOrganisation, setSubscriptionMode } from "@/entities/organisation/server";
import { getDictionary } from "@/shared/i18n/server";
import { actionError, actionSuccess, type ActionState } from "@/shared/lib";

const modeSchema = z.enum(SUBSCRIPTION_MODES);

export const updateSubscriptionModeAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const organisation = await requireCurrentOrganisation();
  const admin = await authorizeMember(organisation.id, ["admin"]);
  const t = await getDictionary();
  if (!admin) return actionError(t.organisationSettings.onlyAdmin);

  const parsed = modeSchema.safeParse(formData.get("subscriptionMode"));
  if (!parsed.success) return actionError(t.common.checkForm);
  await setSubscriptionMode(organisation.id, parsed.data);
  refresh();
  return actionSuccess(t.organisationSettings.saved);
};
