import "server-only";
import { headers } from "next/headers";

/*
 * In-memory fixed-window limiter for server actions that send email.
 * better-auth's own limiter only covers its HTTP endpoints, not `auth.api.*`
 * calls made from server actions. Single-instance only: swap for Redis or a
 * DB-backed counter when running more than one app server.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const hit = (key: string, max: number, windowMs: number): boolean => {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= max;
};

export const clientIp = async (): Promise<string> => {
  const headerList = await headers();
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown"
  );
};

// Returns false when any of the keys is over its limit.
export const allowRequest = async (
  scope: string,
  extraKey?: string,
  { max = 5, windowMs = 10 * 60 * 1000 } = {},
): Promise<boolean> => {
  const ipAllowed = hit(`${scope}:ip:${await clientIp()}`, max * 2, windowMs);
  const keyAllowed = extraKey ? hit(`${scope}:key:${extraKey}`, max, windowMs) : true;
  return ipAllowed && keyAllowed;
};
