"use server";

import { refresh } from "next/cache";
import { addMember, authorizeMember, deleteMembership } from "@/entities/membership/server";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { findOrCreateUserByEmail } from "@/shared/auth";
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
  if (!organisation) return actionError("Only the organisation admin can manage subscribers.");

  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return actionError("Enter a valid email address.");

  const userId = await findOrCreateUserByEmail(parsed.data);
  const result = await addMember(organisation.id, userId, "subscriber");
  refresh();
  if (result.status === "already-member") return actionError(`${parsed.data} is already on the list.`);
  return actionSuccess(`${parsed.data} was added and will receive new issues by email.`);
};

export const removeSubscriberAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const organisation = await authorizeAdmin();
  if (!organisation) return actionError("Only the organisation admin can manage subscribers.");

  const removed = await deleteMembership(organisation.id, String(formData.get("membershipId") ?? ""));
  refresh();
  return removed ? actionSuccess("Subscriber removed.") : actionError("Could not remove this subscriber.");
};
