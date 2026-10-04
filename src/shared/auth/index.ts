export { getAuth } from "./auth";
export { isPlatformAdmin } from "./platformAdmin";
export type { Auth } from "./auth";
export {
  findOrCreateUserByEmail,
  getSessionUser,
  sendSignInLink,
  signInWithCode,
  signOutCurrentUser,
} from "./session";
export type { CodeSignInResult, SessionUser } from "./types";
