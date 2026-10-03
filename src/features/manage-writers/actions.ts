"use server";

import { refresh } from "next/cache";
import { addMember, authorizeMember, demoteWriter } from "@/entities/membership/server";
import { MAX_WRITERS } from "@/entities/membership";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { findOrCreateUserByEmail } from "@/shared/auth";
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
  if (!organisation) return actionError("Only the organisation admin can manage writers.");

  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return actionError("Enter a valid email address.");

  const userId = await findOrCreateUserByEmail(parsed.data);
  const result = await addMember(organisation.id, userId, "writer");
  refresh();

  if (result.status === "writer-limit-reached") {
    return actionError(`You can have at most ${MAX_WRITERS} writers. Remove one first.`);
  }
  if (result.status === "already-member") {
    return actionError(`${parsed.data} is already part of the team.`);
  }

  try {
    await sendWriterInvitation(organisation, parsed.data);
  } catch (error) {
    console.error("[writers] invitation email failed", error);
    return actionSuccess(`${parsed.data} is now a writer, but the invitation email failed. Let them know to sign in.`);
  }
  return actionSuccess(`${parsed.data} is now a writer and has been emailed.`);
};

// Removing a writer keeps them as a regular subscriber; they can unsubscribe themselves.
export const removeWriterAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const organisation = await authorizeAdmin();
  if (!organisation) return actionError("Only the organisation admin can manage writers.");
  const removed = await demoteWriter(organisation.id, String(formData.get("membershipId") ?? ""));
  refresh();
  return removed ? actionSuccess("Writer removed.") : actionError("Could not remove this writer.");
};
