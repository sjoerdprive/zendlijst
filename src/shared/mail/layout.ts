export const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

// Email clients ignore CSS variables, so the palette from globals.css is inlined here.
export const EMAIL_COLORS = {
  paper: "#faf6ee",
  surface: "#ffffff",
  ink: "#1c2333",
  muted: "#5b6478",
  line: "#e7dfd0",
  brand: "#2b44b8",
  accent: "#f26b21",
} as const;

// Minimal, client-safe transactional email wrapper. `bodyHtml` must already be escaped.
export const renderEmailLayout = (title: string, bodyHtml: string, lang = "nl"): string => `<!doctype html>
<html lang="${escapeHtml(lang)}">
  <body style="margin:0;padding:24px;background:${EMAIL_COLORS.paper};font-family:Arial,Helvetica,sans-serif;color:${EMAIL_COLORS.ink}">
    <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:${EMAIL_COLORS.surface};border:1px solid ${EMAIL_COLORS.line};border-top:4px solid ${EMAIL_COLORS.accent};border-radius:12px;padding:32px">
      <tr><td>
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;margin:0 0 16px;color:${EMAIL_COLORS.ink}">${escapeHtml(title)}</h1>
        ${bodyHtml}
      </td></tr>
    </table>
  </body>
</html>`;

export const renderButton = (href: string, label: string): string =>
  `<p style="margin:24px 0"><a href="${escapeHtml(href)}" style="background:${EMAIL_COLORS.brand};color:#ffffff;padding:12px 22px;border-radius:999px;font-weight:bold;text-decoration:none;display:inline-block">${escapeHtml(label)}</a></p>`;
