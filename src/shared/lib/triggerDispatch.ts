import "server-only";
import { getEnv, rootUrl } from "@/shared/config";

/*
 * The scheduled cron only runs once a day, so "send now" kicks the dispatcher
 * itself. It goes through the HTTP endpoint (rather than importing the
 * dispatch feature) so the run gets its own function invocation and timeout.
 */
export const triggerDispatch = async (): Promise<void> => {
  try {
    const response = await fetch(rootUrl("/api/cron/dispatch"), {
      method: "POST",
      headers: { authorization: `Bearer ${getEnv().CRON_SECRET}` },
    });
    if (!response.ok) console.error("[dispatch] trigger failed:", response.status);
  } catch (error) {
    console.error("[dispatch] trigger failed:", error);
  }
};
