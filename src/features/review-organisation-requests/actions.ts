"use server";

import { refresh } from "next/cache";
import { addMember } from "@/entities/membership/server";
import {
  approveOrganisationRequest,
  getPendingOrganisationRequest,
  rejectOrganisationRequest,
} from "@/entities/organisation/server";
import { findOrCreateUserByEmail, getSessionUser, isPlatformAdmin } from "@/shared/auth";
import { actionError, actionSuccess, type ActionState } from "@/shared/lib";
import { sendWelcomeEmail } from "./emails";

export const reviewRequestAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  if (!isPlatformAdmin(await getSessionUser())) return actionError("Not allowed.");

  const requestId = String(formData.get("requestId") ?? "");
  const decision = formData.get("decision");
  const request = await getPendingOrganisationRequest(requestId);
  if (!request) return actionError("This request was already handled.");

  if (decision === "reject") {
    await rejectOrganisationRequest(requestId);
    refresh();
    return actionSuccess(`Rejected ${request.organisationName}.`);
  }

  const organisation = await approveOrganisationRequest(requestId);
  if (!organisation) return actionError("The subdomain is no longer available.");

  const adminUserId = await findOrCreateUserByEmail(request.adminEmail);
  await addMember(organisation.id, adminUserId, "admin");

  try {
    await sendWelcomeEmail(organisation, request.adminEmail);
  } catch (error) {
    console.error("[review] welcome email failed", error);
    refresh();
    return actionError(
      `Approved ${organisation.name}, but the welcome email could not be sent. Let the admin know manually.`,
    );
  }
  refresh();
  return actionSuccess(`Approved ${organisation.name}. The admin has been emailed.`);
};
