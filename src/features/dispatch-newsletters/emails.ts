import "server-only";
import type { FailedDelivery } from "@/entities/delivery";
import type { NewsletterFile } from "@/entities/newsletter";
import type { Organisation } from "@/entities/organisation";
import { organisationUrl } from "@/shared/config";
import { DEFAULT_LOCALE, getDictionaryFor } from "@/shared/i18n";
import {
  EMAIL_COLORS,
  escapeHtml,
  renderButton,
  renderEmailLayout,
  type MailMessage,
} from "@/shared/mail";

// Sent from the scheduler, where no visitor language is known: use the
// platform's main language.
const LOCALE = DEFAULT_LOCALE;
const t = getDictionaryFor(LOCALE).emails;

interface NewsletterEmailInput {
  organisation: Organisation;
  newsletter: NewsletterFile;
  summary: string | null;
  bodyText: string | null;
  to: string;
  unsubscribeToken: string;
}

const footerHtml = (organisationName: string, readUrl: string, unsubscribeUrl: string, privacyUrl: string) => `
<div style="margin:32px auto 0;max-width:560px;padding:16px;border-top:1px solid ${EMAIL_COLORS.line};font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${EMAIL_COLORS.muted};text-align:center">
  ${t.footerReasonHtml(escapeHtml(organisationName))}<br>
  <a href="${escapeHtml(readUrl)}" style="color:${EMAIL_COLORS.brand}">${escapeHtml(t.readOnline)}</a> ·
  <a href="${escapeHtml(unsubscribeUrl)}" style="color:${EMAIL_COLORS.muted}">${escapeHtml(t.unsubscribe)}</a> ·
  <a href="${escapeHtml(privacyUrl)}" style="color:${EMAIL_COLORS.muted}">${escapeHtml(t.privacy)}</a>
</div>`;

// Uploaded HTML is sent as-is (it comes from the organisation's own team) with
// an unsubscribe footer injected before </body>.
const withFooter = (html: string, footer: string): string => {
  const closingBody = html.search(/<\/body>/i);
  return closingBody === -1
    ? `${html}${footer}`
    : `${html.slice(0, closingBody)}${footer}${html.slice(closingBody)}`;
};

export const buildNewsletterEmail = ({
  organisation,
  newsletter,
  summary,
  bodyText,
  to,
  unsubscribeToken,
}: NewsletterEmailInput): MailMessage => {
  const readUrl = organisationUrl(organisation.slug, `/newsletters/${newsletter.id}`);
  const unsubscribeUrl = organisationUrl(
    organisation.slug,
    `/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`,
  );
  const oneClickUrl = organisationUrl(
    organisation.slug,
    `/api/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`,
  );
  const subject = `${organisation.name}: ${newsletter.title}`;
  const footer = footerHtml(
    organisation.name,
    readUrl,
    unsubscribeUrl,
    organisationUrl(organisation.slug, "/privacy"),
  );
  const text = [
    newsletter.title,
    bodyText ?? summary ?? "",
    `${t.readOnline}: ${readUrl}`,
    `${t.unsubscribe}: ${unsubscribeUrl}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const headers = {
    "List-Unsubscribe": `<${oneClickUrl}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };

  if (newsletter.contentType === "text/html") {
    return {
      to,
      subject,
      text,
      headers,
      html: withFooter(newsletter.content.toString("utf8"), footer),
    };
  }

  return {
    to,
    subject,
    text,
    headers,
    html: renderEmailLayout(
      newsletter.title,
      `${summary ? `<p>${escapeHtml(summary)}</p>` : ""}
      <p>${t.pdfAttachedHtml(escapeHtml(organisation.name))}</p>
      ${renderButton(readUrl, t.readOnline)}${footer}`,
      LOCALE,
    ),
    attachments: [
      { filename: newsletter.fileName, content: newsletter.content, contentType: newsletter.contentType },
    ],
  };
};

interface FailureAlertInput {
  organisation: Organisation;
  newsletterTitle: string;
  failures: FailedDelivery[];
  to: string;
}

export const buildFailureAlertEmail = ({
  organisation,
  newsletterTitle,
  failures,
  to,
}: FailureAlertInput): MailMessage => {
  const dashboardUrl = organisationUrl(organisation.slug, "/team");
  const alert = t.failureAlert;
  const subject = alert.subject(failures.length, newsletterTitle);
  const rows = failures
    .map(
      (failure) =>
        `<li><strong>${escapeHtml(failure.email)}</strong><br><span style="color:${EMAIL_COLORS.muted};font-size:12px">${escapeHtml(failure.lastError ?? alert.unknownError)}</span></li>`,
    )
    .join("");
  return {
    to,
    subject,
    text: `${alert.textIntro(failures.length, newsletterTitle)}\n\n${failures
      .map((failure) => `- ${failure.email} (${failure.lastError ?? alert.unknownError})`)
      .join("\n")}\n\n${alert.textOutro(dashboardUrl)}`,
    html: renderEmailLayout(
      alert.heading,
      `<p>${alert.bodyHtml(escapeHtml(newsletterTitle))}</p>
      <ul>${rows}</ul>
      ${renderButton(dashboardUrl, alert.button)}
      <p style="color:${EMAIL_COLORS.muted};font-size:13px">${escapeHtml(alert.outro)}</p>`,
      LOCALE,
    ),
  };
};
