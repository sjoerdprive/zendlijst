import "server-only";
import type { Organisation } from "@/entities/organisation";
import { organisationUrl } from "@/shared/config";
import { escapeHtml, renderButton, renderEmailLayout, sendMail } from "@/shared/mail";

export const sendWelcomeEmail = async (organisation: Organisation, adminEmail: string) => {
  const url = organisationUrl(organisation.slug, "/sign-in");
  await sendMail({
    to: adminEmail,
    subject: `Your newsletter space for ${organisation.name} is ready`,
    text: `Good news! ${organisation.name} now lives at ${organisationUrl(organisation.slug)}.\n\nSign in with this address to add writers, upload newsletters and manage subscribers: ${url}`,
    html: renderEmailLayout(
      `${organisation.name} is ready`,
      `<p>Your newsletter space lives at <strong>${escapeHtml(organisationUrl(organisation.slug))}</strong>. Share that address with your audience so they can subscribe.</p>
      <p>Sign in with this email address to add up to two writers, upload and schedule newsletters, and manage subscribers.</p>
      ${renderButton(url, "Go to your newsletter")}`,
    ),
  });
};
