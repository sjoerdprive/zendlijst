import "server-only";
import type { NextRequest } from "next/server";
import { getCurrentOrganisation } from "@/entities/organisation/server";
import { getSessionUser } from "@/shared/auth";
import { homeQueryFor, joinOrganisation } from "./join";
import { isValidSubscribeToken } from "./utils";

// Relative Location keeps the browser on the tenant's subdomain; `request.url`
// inside a rewritten route reflects the internal host instead.
const redirectHome = (query: string) =>
  new Response(null, { status: 303, headers: { Location: `/?${query}` } });

// Landing point of the magic link sent by `subscribeAction`. better-auth has
// already verified the email and set the session cookie at this point.
export const confirmSubscription = async (request: NextRequest): Promise<Response> => {
  const organisation = await getCurrentOrganisation();
  const sessionUser = await getSessionUser();
  if (!organisation || !sessionUser) return redirectHome("error=confirm");

  const notify = request.nextUrl.searchParams.get("notify") === "1";
  const token = request.nextUrl.searchParams.get("token") ?? "";
  if (!isValidSubscribeToken(token, sessionUser.email, notify)) {
    return redirectHome("error=confirm");
  }

  return redirectHome(homeQueryFor(await joinOrganisation(organisation, sessionUser.id, notify)));
};
