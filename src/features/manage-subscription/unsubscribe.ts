import "server-only";
import {
  deleteMembership,
  getMembershipById,
  parseUnsubscribeToken,
  setEmailNotifications,
} from "@/entities/membership/server";

export type UnsubscribeResult = "unsubscribed" | "notifications-off" | "invalid";

/*
 * Used by the unsubscribe page and the RFC 8058 one-click endpoint. Admins
 * cannot leave their own organisation, so for them only notifications are
 * switched off. `organisationId` (when known from the host) prevents a token
 * from one tenant being redeemed on another tenant's domain.
 */
export const unsubscribeByToken = async (
  token: string,
  organisationId?: string,
): Promise<UnsubscribeResult> => {
  const membershipId = parseUnsubscribeToken(token);
  if (!membershipId) return "invalid";
  const target = await getMembershipById(membershipId);
  if (!target) return "invalid";
  if (organisationId && target.organisationId !== organisationId) return "invalid";

  if (target.role === "admin") {
    await setEmailNotifications(target.id, false);
    return "notifications-off";
  }
  await deleteMembership(target.organisationId, target.id, ["writer", "subscriber"]);
  return "unsubscribed";
};
