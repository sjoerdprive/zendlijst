import "server-only";
import {
  createSubscriptionRequest,
  ensureSubscription,
  getMembership,
} from "@/entities/membership/server";
import type { Organisation } from "@/entities/organisation";
import type { JoinResult } from "./types";

// Applies the organisation's subscription policy to a verified user.
export const joinOrganisation = async (
  organisation: Organisation,
  userId: string,
  emailNotifications: boolean,
): Promise<JoinResult> => {
  if (await getMembership(organisation.id, userId)) return "joined";
  if (organisation.subscriptionMode === "closed") return "closed";
  if (organisation.subscriptionMode === "approval") {
    await createSubscriptionRequest(organisation.id, userId, emailNotifications);
    return "requested";
  }
  await ensureSubscription(organisation.id, userId, emailNotifications);
  return "joined";
};

export const homeQueryFor = (result: JoinResult): string => {
  if (result === "joined") return "welcome=1";
  if (result === "requested") return "requested=1";
  return "error=closed";
};
