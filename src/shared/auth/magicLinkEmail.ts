import "server-only";
import { DEFAULT_LOCALE, getDictionaryFor, isLocale } from "@/shared/i18n";
import { EMAIL_COLORS, escapeHtml, renderButton, renderEmailLayout, sendMail } from "@/shared/mail";

interface MagicLinkEmail {
  email: string;
  url: string;
  code: string;
  metadata?: Record<string, unknown>;
}

export const sendMagicLinkEmail = async ({
  email,
  url,
  code,
  metadata,
}: MagicLinkEmail): Promise<void> => {
  // The requester's language travels with the link request (see sendSignInLink).
  const locale = isLocale(metadata?.locale) ? metadata.locale : DEFAULT_LOCALE;
  const dictionary = getDictionaryFor(locale);
  const t = dictionary.emails.magicLink;
  const context =
    typeof metadata?.organisationName === "string"
      ? metadata.organisationName
      : dictionary.meta.title;
  const subject = t.subject(context);
  await sendMail({
    to: email,
    subject,
    text: `${t.text(context)}\n\n${url}\n\n${t.codeText(code)}\n\n${t.ignore}`,
    html: renderEmailLayout(
      subject,
      `<p>${t.bodyHtml(escapeHtml(context))}</p>
      ${renderButton(url, t.button)}
      <p style="margin:24px 0 8px;color:${EMAIL_COLORS.muted};font-size:14px">${escapeHtml(t.codeIntro)}</p>
      <p style="margin:0 0 24px;font-family:'Courier New',monospace;font-size:30px;font-weight:bold;letter-spacing:8px;color:${EMAIL_COLORS.ink}">${escapeHtml(code)}</p>
      <p style="color:${EMAIL_COLORS.muted};font-size:13px">${escapeHtml(t.ignore)}</p>`,
      locale,
    ),
  });
};
