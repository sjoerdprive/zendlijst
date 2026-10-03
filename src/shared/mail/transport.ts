import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { getEnv } from "@/shared/config/env";
import type { MailMessage } from "./types";

let transporter: Transporter | undefined;

const getTransporter = (): Transporter => {
  if (!transporter) {
    const env = getEnv();
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
};

// Throws when the SMTP server rejects the message; callers decide how to
// record the failure. Recipients rejected by the server count as a failure.
export const sendMail = async (message: MailMessage): Promise<void> => {
  const info = await getTransporter().sendMail({
    from: getEnv().MAIL_FROM,
    ...message,
  });
  if ((info.rejected ?? []).length > 0) {
    throw new Error(`Recipient rejected by mail server: ${String(info.response)}`);
  }
};
