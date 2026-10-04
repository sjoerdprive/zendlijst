import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { getEnv } from "@/shared/config/env";

// Ciphertext format: "v1:<iv>:<authTag>:<ciphertext>" (base64url parts).
// The version prefix leaves room for key rotation without a schema change.
const VERSION = "v1";
const IV_BYTES = 12;

const encryptionKey = (): Buffer =>
  Buffer.from(getEnv().EMAIL_ENCRYPTION_KEY, "base64");

const hashKey = (): Buffer => Buffer.from(getEnv().EMAIL_HASH_KEY, "base64");

export const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase();

export const encryptText = (plaintext: string): string => {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv, tag, ciphertext]
    .map((part) => (typeof part === "string" ? part : part.toString("base64url")))
    .join(":");
};

export const decryptText = (payload: string): string => {
  const [version, iv, tag, ciphertext] = payload.split(":");
  if (version !== VERSION || !iv || !tag || !ciphertext) {
    throw new Error("Unsupported ciphertext format");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
};

export const encryptEmail = (email: string): string =>
  encryptText(normalizeEmail(email));

export const decryptEmail = decryptText;

// Deterministic keyed hash ("blind index") used for equality lookups and
// uniqueness without storing the address itself.
export const emailBlindIndex = (email: string): string =>
  createHmac("sha256", hashKey()).update(normalizeEmail(email)).digest("hex");

// Keyed hash for lookup keys that embed an email address (e.g. sign-in codes).
export const hashIdentifier = (value: string): string =>
  createHmac("sha256", hashKey()).update(`identifier:${value}`).digest("hex");

export const isBlindIndex = (value: string): boolean =>
  /^[0-9a-f]{64}$/.test(value);

// Signed, non-expiring token for one-click unsubscribe links.
export const signToken = (value: string): string => {
  const signature = createHmac("sha256", hashKey())
    .update(`token:${value}`)
    .digest("base64url");
  return `${value}.${signature}`;
};

export const verifyToken = (token: string): string | null => {
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;
  const value = token.slice(0, separator);
  const expected = Buffer.from(signToken(value));
  const actual = Buffer.from(token);
  if (expected.length !== actual.length) return null;
  return timingSafeEqual(expected, actual) ? value : null;
};
