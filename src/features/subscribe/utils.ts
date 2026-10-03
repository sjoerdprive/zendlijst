import "server-only";
import { emailBlindIndex, signToken, verifyToken } from "@/shared/crypto";

// Binds the confirmation link to the address that requested it, so a link
// cannot be replayed to subscribe a different signed-in user.
const tokenValue = (email: string, notify: boolean) =>
  `subscribe:${emailBlindIndex(email)}:${notify ? 1 : 0}`;

export const createSubscribeToken = (email: string, notify: boolean): string =>
  signToken(tokenValue(email, notify));

export const isValidSubscribeToken = (
  token: string,
  email: string,
  notify: boolean,
): boolean => verifyToken(token) === tokenValue(email, notify);
