import "server-only";
import type { Organisation } from "@/entities/organisation";
import { organisationUrl } from "@/shared/config";
import { DEFAULT_LOCALE, getDictionaryFor } from "@/shared/i18n";
import { escapeHtml, renderButton, renderEmailLayout, sendMail } from "@/shared/mail";

// The new admin's language is unknown, so this uses the platform's main language.
export const sendWelcomeEmail = async (organisation: Organisation, adminEmail: string) => {
  const t = getDictionaryFor(DEFAULT_LOCALE).emails.welcome;
  const home = organisationUrl(organisation.slug);
  const url = organisationUrl(organisation.slug, "/sign-in");
  await sendMail({
    to: adminEmail,
    subject: t.subject(organisation.name),
    text: t.text(organisation.name, home, url),
    html: renderEmailLayout(
      t.heading(organisation.name),
      `<p>${t.addressHtml(escapeHtml(home))}</p>
      <p>${escapeHtml(t.signIn)}</p>
      ${renderButton(url, t.button)}`,
      DEFAULT_LOCALE,
    ),
  });
};
