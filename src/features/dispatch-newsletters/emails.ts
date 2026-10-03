import "server-only";
import type { FailedDelivery } from "@/entities/delivery";
import type { NewsletterFile } from "@/entities/newsletter";
import type { Organisation } from "@/entities/organisation";
import { organisationUrl } from "@/shared/config";
import { escapeHtml, renderButton, renderEmailLayout, type MailMessage } from "@/shared/mail";

interface NewsletterEmailInput {
  organisation: Organisation;
  newsletter: NewsletterFile;
  summary: string | null;
  to: string;
  unsubscribeToken: string;
}

const footerHtml = (organisationName: string, readUrl: string, unsubscribeUrl: string) => `
<div style="margin:32px auto 0;max-width:560px;padding:16px;border-top:1px solid #e4e4e7;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#71717a;text-align:center">
  You receive this because you subscribed to ${escapeHtml(organisationName)}.<br>
  <a href="${escapeHtml(readUrl)}" style="color:#71717a">Read online</a> ·
  <a href="${escapeHtml(unsubscribeUrl)}" style="color:#71717a">Unsubscribe</a>
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
  const footer = footerHtml(organisation.name, readUrl, unsubscribeUrl);
  const text = [
    newsletter.title,
    summary ?? "",
    `Read online: ${readUrl}`,
    `Unsubscribe: ${unsubscribeUrl}`,
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
      <p>The new issue of ${escapeHtml(organisation.name)} is attached as a PDF.</p>
      ${renderButton(readUrl, "Read online")}${footer}`,
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
  const subject = `Action needed: ${failures.length} email(s) for “${newsletterTitle}” could not be delivered`;
  const rows = failures
    .map(
      (failure) =>
        `<li><strong>${escapeHtml(failure.email)}</strong><br><span style="color:#71717a;font-size:12px">${escapeHtml(failure.lastError ?? "Unknown error")}</span></li>`,
    )
    .join("");
  return {
    to,
    subject,
    text: `${failures.length} recipient(s) did not receive "${newsletterTitle}" after several attempts. Please send it to them manually:\n\n${failures
      .map((failure) => `- ${failure.email} (${failure.lastError ?? "unknown error"})`)
      .join("\n")}\n\nOpen the team dashboard to download the newsletter and mark them as handled: ${dashboardUrl}`,
    html: renderEmailLayout(
      "Some newsletter emails could not be delivered",
      `<p>We tried several times, but the following recipients did not receive <strong>${escapeHtml(newsletterTitle)}</strong>. Please send it to them manually.</p>
      <ul>${rows}</ul>
      ${renderButton(dashboardUrl, "Open team dashboard")}
      <p style="color:#71717a;font-size:13px">In the dashboard you can download the newsletter and mark each recipient as handled.</p>`,
    ),
  };
};
