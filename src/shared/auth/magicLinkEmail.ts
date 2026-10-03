import "server-only";
import { DEFAULT_LOCALE, getDictionaryFor, isLocale } from "@/shared/i18n";
import { EMAIL_COLORS, escapeHtml, renderButton, renderEmailLayout, sendMail } from "@/shared/mail";

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
  // The requester's language travels with the link request (see sendSignInLink).
  const locale = isLocale(metadata?.locale) ? metadata.locale : DEFAULT_LOCALE;
  const t = getDictionaryFor(locale).emails.magicLink;
  const context =
    typeof metadata?.organisationName === "string"
      ? metadata.organisationName
      : "Nieuwsbrief";
  const subject = t.subject(context);
  await sendMail({
    to: email,
    subject,
    text: `${t.text(context)}\n\n${url}\n\n${t.ignore}`,
    html: renderEmailLayout(
      subject,
      `<p>${t.bodyHtml(escapeHtml(context))}</p>
      ${renderButton(url, t.button)}
      <p style="color:${EMAIL_COLORS.muted};font-size:13px">${escapeHtml(t.ignore)}</p>`,
      locale,
    ),
  });
};
