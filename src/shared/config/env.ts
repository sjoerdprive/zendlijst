import "server-only";
import { z } from "zod";

const base64Key = z
  .string()
  .refine((value) => Buffer.from(value, "base64").length === 32, {
    message: "must be a base64-encoded 32-byte key (openssl rand -base64 32)",
  });

const envSchema = z.object({
  DATABASE_URL: z.url(),
  APP_ROOT_DOMAIN: z.string().min(1),
  APP_PROTOCOL: z.enum(["http", "https"]).default("https"),
  BETTER_AUTH_SECRET: z.string().min(32),
  EMAIL_ENCRYPTION_KEY: base64Key,
  EMAIL_HASH_KEY: base64Key,
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_SECURE: z.stringbool().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().min(1),
  CRON_SECRET: z.string().min(16),
  PLATFORM_ADMIN_EMAILS: z
    .string()
    .default("")
    .transform((value) =>
      value
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

// Parsed lazily so `next build` does not require runtime secrets.
export const getEnv = (): Env => {
  if (!cached) {
    cached = envSchema.parse(process.env);
  }
  return cached;
};
