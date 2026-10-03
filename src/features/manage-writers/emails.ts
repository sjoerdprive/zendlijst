import "server-only";
import type { Organisation } from "@/entities/organisation";
import { organisationUrl } from "@/shared/config";
import { DEFAULT_LOCALE, getDictionaryFor } from "@/shared/i18n";
import { escapeHtml, renderButton, renderEmailLayout, sendMail } from "@/shared/mail";

// The invitee's language is unknown, so invitations use the platform's main language.
export const sendWriterInvitation = async (organisation: Organisation, email: string) => {
  const t = getDictionaryFor(DEFAULT_LOCALE).emails.writerInvite;
  const url = organisationUrl(organisation.slug, "/sign-in");
  await sendMail({
    to: email,
    subject: t.subject(organisation.name),
    text: t.text(organisation.name, url),
    html: renderEmailLayout(
      t.heading(organisation.name),
      `<p>${t.bodyHtml(escapeHtml(organisation.name))}</p>
      ${renderButton(url, t.button)}`,
      DEFAULT_LOCALE,
    ),
  });
};
