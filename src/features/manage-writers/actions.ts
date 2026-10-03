"use server";

import { refresh } from "next/cache";
import { addMember, authorizeMember, demoteWriter } from "@/entities/membership/server";
import { MAX_WRITERS } from "@/entities/membership";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { findOrCreateUserByEmail } from "@/shared/auth";
import { getDictionary } from "@/shared/i18n/server";
import { actionError, actionSuccess, emailSchema, type ActionState } from "@/shared/lib";
import { sendWriterInvitation } from "./emails";

const authorizeAdmin = async () => {
  const organisation = await requireCurrentOrganisation();
  const admin = await authorizeMember(organisation.id, ["admin"]);
  return admin ? organisation : null;
};

export const addWriterAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const organisation = await authorizeAdmin();
  const t = await getDictionary();
  if (!organisation) return actionError(t.writers.onlyAdmin);

  const parsed = emailSchema(t.common.invalidEmail).safeParse(formData.get("email"));
  if (!parsed.success) return actionError(t.common.invalidEmail);

  const userId = await findOrCreateUserByEmail(parsed.data);
  const result = await addMember(organisation.id, userId, "writer");
  refresh();

  if (result.status === "writer-limit-reached") {
    return actionError(t.writers.limitError(MAX_WRITERS));
  }
  if (result.status === "already-member") {
    return actionError(t.writers.alreadyTeam(parsed.data));
  }

  try {
    await sendWriterInvitation(organisation, parsed.data);
  } catch (error) {
    console.error("[writers] invitation email failed", error);
    return actionSuccess(t.writers.inviteFailed(parsed.data));
  }
  return actionSuccess(t.writers.added(parsed.data));
};

// Removing a writer keeps them as a regular subscriber; they can unsubscribe themselves.
export const removeWriterAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const organisation = await authorizeAdmin();
  const t = await getDictionary();
  if (!organisation) return actionError(t.writers.onlyAdmin);
  const removed = await demoteWriter(organisation.id, String(formData.get("membershipId") ?? ""));
  refresh();
  return removed ? actionSuccess(t.writers.removed) : actionError(t.writers.couldNotRemove);
};
