import "server-only";
import { timingSafeEqual } from "node:crypto";
import { getEnv } from "@/shared/config";

// Accepts "Authorization: Bearer <CRON_SECRET>" (also what Vercel Cron sends).
export const isAuthorizedCronRequest = (request: Request): boolean => {
  const header = request.headers.get("authorization") ?? "";
  const expected = Buffer.from(`Bearer ${getEnv().CRON_SECRET}`);
  const actual = Buffer.from(header);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};
