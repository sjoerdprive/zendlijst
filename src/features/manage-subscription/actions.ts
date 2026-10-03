"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import {
  authorizeMember,
  deleteMembership,
  setEmailNotifications,
} from "@/entities/membership/server";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { getDictionary } from "@/shared/i18n/server";
import { actionError, actionSuccess, type ActionState } from "@/shared/lib";
import { unsubscribeByToken } from "./unsubscribe";

export const updateNotificationsAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const organisation = await requireCurrentOrganisation();
  const member = await authorizeMember(organisation.id);
  const t = await getDictionary();
  if (!member) return actionError(t.settings.signInAgain);
  const enabled = formData.get("emailNotifications") === "on";
  await setEmailNotifications(member.id, enabled);
  refresh();
  return actionSuccess(enabled ? t.settings.notificationsOn : t.settings.notificationsOff);
};

export const unsubscribeAction = async (): Promise<void> => {
  const organisation = await requireCurrentOrganisation();
  const member = await authorizeMember(organisation.id, ["writer", "subscriber"]);
  if (member) {
    await deleteMembership(organisation.id, member.id, ["writer", "subscriber"]);
  }
  redirect("/?unsubscribed=1");
};

export const unsubscribeWithTokenAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const organisation = await requireCurrentOrganisation();
  const result = await unsubscribeByToken(String(formData.get("token") ?? ""), organisation.id);
  const t = await getDictionary();
  if (result === "invalid") return actionError(t.unsubscribe.invalid);
  return actionSuccess(result === "notifications-off" ? t.unsubscribe.notificationsOff : t.unsubscribe.done);
};
