import "server-only";
import type { Organisation } from "@/entities/organisation";
import { organisationUrl } from "@/shared/config";
import { escapeHtml, renderButton, renderEmailLayout, sendMail } from "@/shared/mail";

export const sendWriterInvitation = async (organisation: Organisation, email: string) => {
  const url = organisationUrl(organisation.slug, "/sign-in");
  await sendMail({
    to: email,
    subject: `You were added as a writer for ${organisation.name}`,
    text: `You can now upload newsletters and keep notes for ${organisation.name}. Sign in with this address: ${url}`,
    html: renderEmailLayout(
      `Welcome to the ${organisation.name} team`,
      `<p>You were added as a writer. You can now upload and schedule newsletters and keep notes for <strong>${escapeHtml(organisation.name)}</strong>.</p>
      ${renderButton(url, "Sign in")}`,
    ),
  });
};
