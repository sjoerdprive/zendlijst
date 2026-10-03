import "server-only";
import { getEnv } from "@/shared/config";
import type { SessionUser } from "./types";

// Platform operators are configured via PLATFORM_ADMIN_EMAILS, not stored in the DB.
export const isPlatformAdmin = (sessionUser: SessionUser | null): boolean =>
  !!sessionUser && getEnv().PLATFORM_ADMIN_EMAILS.includes(sessionUser.email.toLowerCase());
