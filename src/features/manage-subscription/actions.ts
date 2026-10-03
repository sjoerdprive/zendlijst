"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import {
  authorizeMember,
  deleteMembership,
  setEmailNotifications,
} from "@/entities/membership/server";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { actionError, actionSuccess, type ActionState } from "@/shared/lib";
import { unsubscribeByToken } from "./unsubscribe";

export const updateNotificationsAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const organisation = await requireCurrentOrganisation();
  const member = await authorizeMember(organisation.id);
  if (!member) return actionError("Please sign in again.");
  const enabled = formData.get("emailNotifications") === "on";
  await setEmailNotifications(member.id, enabled);
  refresh();
  return actionSuccess(
    enabled
      ? "You will receive new issues by email."
      : "Email notifications are off. You can still read every issue here.",
  );
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
  if (result === "invalid") return actionError("This unsubscribe link is invalid or has already been used.");
  return actionSuccess(
    result === "notifications-off"
      ? "Email notifications are turned off for your account."
      : "You have been unsubscribed. Sorry to see you go!",
  );
};
