export const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

// Minimal, client-safe transactional email wrapper. `bodyHtml` must already be escaped.
export const renderEmailLayout = (title: string, bodyHtml: string): string => `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b">
    <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px">
      <tr><td>
        <h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(title)}</h1>
        ${bodyHtml}
      </td></tr>
    </table>
  </body>
</html>`;

export const renderButton = (href: string, label: string): string =>
  `<p style="margin:24px 0"><a href="${escapeHtml(href)}" style="background:#18181b;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">${escapeHtml(label)}</a></p>`;
