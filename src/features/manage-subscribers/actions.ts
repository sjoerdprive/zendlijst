"use server";

import { refresh } from "next/cache";
import { addMember, authorizeMember, deleteMembership } from "@/entities/membership/server";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { findOrCreateUserByEmail } from "@/shared/auth";
import { getDictionary } from "@/shared/i18n/server";
import { actionError, actionSuccess, emailSchema, type ActionState } from "@/shared/lib";

const authorizeAdmin = async () => {
  const organisation = await requireCurrentOrganisation();
  const admin = await authorizeMember(organisation.id, ["admin"]);
  return admin ? organisation : null;
};

export const addSubscriberAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const organisation = await authorizeAdmin();
  const t = await getDictionary();
  if (!organisation) return actionError(t.subscribers.onlyAdmin);

  const parsed = emailSchema(t.common.invalidEmail).safeParse(formData.get("email"));
  if (!parsed.success) return actionError(t.common.invalidEmail);

  const userId = await findOrCreateUserByEmail(parsed.data);
  const result = await addMember(organisation.id, userId, "subscriber");
  refresh();
  if (result.status === "already-member") return actionError(t.subscribers.alreadyOnList(parsed.data));
  return actionSuccess(t.subscribers.added(parsed.data));
};

export const removeSubscriberAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const organisation = await authorizeAdmin();
  const t = await getDictionary();
  if (!organisation) return actionError(t.subscribers.onlyAdmin);

  const removed = await deleteMembership(organisation.id, String(formData.get("membershipId") ?? ""));
  refresh();
  return removed ? actionSuccess(t.subscribers.removed) : actionError(t.subscribers.couldNotRemove);
};
