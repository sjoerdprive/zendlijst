import "server-only";
import { signToken, verifyToken } from "@/shared/crypto";

const PREFIX = "unsubscribe:";

// Non-expiring signed token for unsubscribe links in emails (RFC 8058 compatible).
export const createUnsubscribeToken = (membershipId: string): string =>
  signToken(`${PREFIX}${membershipId}`);

export const parseUnsubscribeToken = (token: string): string | null => {
  const value = verifyToken(token);
  return value?.startsWith(PREFIX) ? value.slice(PREFIX.length) : null;
};
