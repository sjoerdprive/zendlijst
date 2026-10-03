"use server";

import { refresh } from "next/cache";
import { addMember } from "@/entities/membership/server";
import {
  approveOrganisationRequest,
  getPendingOrganisationRequest,
  rejectOrganisationRequest,
} from "@/entities/organisation/server";
import { findOrCreateUserByEmail, getSessionUser, isPlatformAdmin } from "@/shared/auth";
import { getDictionary } from "@/shared/i18n/server";
import { actionError, actionSuccess, type ActionState } from "@/shared/lib";
import { sendWelcomeEmail } from "./emails";

export const reviewRequestAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const t = await getDictionary();
  if (!isPlatformAdmin(await getSessionUser())) return actionError(t.common.notAllowed);

  const requestId = String(formData.get("requestId") ?? "");
  const decision = formData.get("decision");
  const request = await getPendingOrganisationRequest(requestId);
  if (!request) return actionError(t.platformAdmin.alreadyHandled);

  if (decision === "reject") {
    await rejectOrganisationRequest(requestId);
    refresh();
    return actionSuccess(t.platformAdmin.rejectedMessage(request.organisationName));
  }

  const organisation = await approveOrganisationRequest(requestId);
  if (!organisation) return actionError(t.platformAdmin.slugUnavailable);

  const adminUserId = await findOrCreateUserByEmail(request.adminEmail);
  await addMember(organisation.id, adminUserId, "admin");

  try {
    await sendWelcomeEmail(organisation, request.adminEmail);
  } catch (error) {
    console.error("[review] welcome email failed", error);
    refresh();
    return actionError(t.platformAdmin.approvedEmailFailed(organisation.name));
  }
  refresh();
  return actionSuccess(t.platformAdmin.approvedMessage(organisation.name));
};
