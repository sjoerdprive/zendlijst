import "server-only";
import { escapeHtml, renderButton, renderEmailLayout, sendMail } from "@/shared/mail";

interface MagicLinkEmail {
  email: string;
  url: string;
  metadata?: Record<string, unknown>;
}

export const sendMagicLinkEmail = async ({
  email,
  url,
  metadata,
}: MagicLinkEmail): Promise<void> => {
  const context =
    typeof metadata?.organisationName === "string"
      ? metadata.organisationName
      : "Nieuwsbrief";
  const subject = `Your sign-in link for ${context}`;
  await sendMail({
    to: email,
    subject,
    text: `Use this link to sign in to ${context}. It expires in 15 minutes.\n\n${url}\n\nIf you did not request this, you can ignore this email.`,
    html: renderEmailLayout(
      subject,
      `<p>Use the button below to confirm your email address and sign in to <strong>${escapeHtml(context)}</strong>. The link expires in 15 minutes and works once.</p>
      ${renderButton(url, "Sign in")}
      <p style="color:#71717a;font-size:13px">If you did not request this, you can ignore this email.</p>`,
    ),
  });
};
