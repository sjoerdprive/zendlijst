import "server-only";
import { EMAIL_COLORS, escapeHtml } from "@/shared/mail";
import { safeImageSrc, safeLinkHref } from "./editorDocument";
import { sanitizeNewsletterHtml } from "./sanitize";
import type { EditorDocument, EditorMark, EditorNode } from "./types";

/*
 * Renders the editor's JSON as email-safe HTML: every element carries inline
 * styles (email clients ignore stylesheets), all text is escaped, and only
 * http(s)/mailto links and http(s) images survive. The result still goes
 * through the same DOMPurify pass as uploaded HTML.
 */

const FONT = "Arial,Helvetica,sans-serif";
const DISPLAY_FONT = "Georgia,'Times New Roman',serif";

const STYLES = {
  p: `margin:0 0 16px;font-size:16px;line-height:1.6;color:${EMAIL_COLORS.ink}`,
  h2: `margin:28px 0 12px;font-family:${DISPLAY_FONT};font-size:22px;line-height:1.3;color:${EMAIL_COLORS.ink}`,
  h3: `margin:24px 0 8px;font-family:${DISPLAY_FONT};font-size:18px;line-height:1.35;color:${EMAIL_COLORS.ink}`,
  list: `margin:0 0 16px;padding-left:24px;font-size:16px;line-height:1.6;color:${EMAIL_COLORS.ink}`,
  li: "margin:0 0 4px",
  blockquote: `margin:0 0 16px;padding:4px 0 4px 16px;border-left:4px solid ${EMAIL_COLORS.accent};color:${EMAIL_COLORS.muted}`,
  hr: `border:0;border-top:1px solid ${EMAIL_COLORS.line};margin:28px 0`,
  img: "display:block;max-width:100%;height:auto;margin:0 0 16px;border-radius:8px",
  a: `color:${EMAIL_COLORS.brand};text-decoration:underline`,
} as const;

const wrapMark = (html: string, mark: EditorMark): string => {
  switch (mark.type) {
    case "bold":
      return `<strong>${html}</strong>`;
    case "italic":
      return `<em>${html}</em>`;
    case "underline":
      return `<u>${html}</u>`;
    case "strike":
      return `<s>${html}</s>`;
    case "link": {
      const href = safeLinkHref(mark.attrs?.href);
      return href
        ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" style="${STYLES.a}">${html}</a>`
        : html;
    }
    default:
      return html;
  }
};

const renderChildren = (node: EditorNode): string => (node.content ?? []).map(renderNode).join("");

// Inside list items Tiptap wraps text in paragraphs; drop their bottom margin.
const renderListItem = (node: EditorNode): string =>
  `<li style="${STYLES.li}">${(node.content ?? [])
    .map((child) =>
      child.type === "paragraph" ? `<div>${renderChildren(child)}</div>` : renderNode(child),
    )
    .join("")}</li>`;

const renderNode = (node: EditorNode): string => {
  switch (node.type) {
    case "doc":
      return renderChildren(node);
    case "text":
      return (node.marks ?? []).reduce(wrapMark, escapeHtml(node.text ?? ""));
    case "paragraph": {
      const inner = renderChildren(node);
      return `<p style="${STYLES.p}">${inner || "&nbsp;"}</p>`;
    }
    case "heading": {
      const tag = node.attrs?.level === 3 ? "h3" : "h2";
      return `<${tag} style="${STYLES[tag]}">${renderChildren(node)}</${tag}>`;
    }
    case "bulletList":
      return `<ul style="${STYLES.list}">${(node.content ?? []).map(renderListItem).join("")}</ul>`;
    case "orderedList": {
      const start = Number(node.attrs?.start);
      const startAttr = Number.isInteger(start) && start > 1 ? ` start="${start}"` : "";
      return `<ol${startAttr} style="${STYLES.list}">${(node.content ?? []).map(renderListItem).join("")}</ol>`;
    }
    case "listItem":
      return renderListItem(node);
    case "blockquote":
      return `<blockquote style="${STYLES.blockquote}">${renderChildren(node)}</blockquote>`;
    case "horizontalRule":
      return `<hr style="${STYLES.hr}">`;
    case "hardBreak":
      return "<br>";
    case "image": {
      const src = safeImageSrc(node.attrs?.src);
      if (!src) return "";
      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
      return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" style="${STYLES.img}">`;
    }
    default:
      return "";
  }
};

interface RenderInput {
  title: string;
  summary: string | null;
  organisationName: string;
  body: EditorDocument;
  lang?: string;
}

export const renderNewsletterHtml = ({ title, summary, organisationName, body, lang = "nl" }: RenderInput): string => {
  // The summary doubles as the inbox preview text, hidden in the message itself.
  const preheader = summary
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(summary)}</div>`
    : "";
  const html = `<html lang="${escapeHtml(lang)}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:24px 12px;background:${EMAIL_COLORS.paper};font-family:${FONT};color:${EMAIL_COLORS.ink}">
${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:${EMAIL_COLORS.surface};border:1px solid ${EMAIL_COLORS.line};border-top:4px solid ${EMAIL_COLORS.accent};border-radius:12px">
<tr><td style="padding:32px">
<p style="margin:0 0 8px;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${EMAIL_COLORS.muted}">${escapeHtml(organisationName)}</p>
<h1 style="margin:0 0 24px;font-family:${DISPLAY_FONT};font-size:28px;line-height:1.25;color:${EMAIL_COLORS.ink}">${escapeHtml(title)}</h1>
${renderNode(body)}
</td></tr>
</table>
</body>
</html>`;
  return sanitizeNewsletterHtml(html);
};

const textOf = (node: EditorNode): string => {
  if (node.type === "text") {
    const text = node.text ?? "";
    const link = node.marks?.find((mark) => mark.type === "link");
    const href = link ? safeLinkHref(link.attrs?.href) : null;
    return href && href !== text ? `${text} (${href})` : text;
  }
  if (node.type === "hardBreak") return "\n";
  return (node.content ?? []).map(textOf).join("");
};

const blockText = (node: EditorNode): string[] => {
  switch (node.type) {
    case "doc":
    case "blockquote":
      return (node.content ?? []).flatMap(blockText);
    case "heading":
      return [textOf(node).toUpperCase()];
    case "bulletList":
      return [(node.content ?? []).map((item) => `- ${textOf(item)}`).join("\n")];
    case "orderedList": {
      const start = Number(node.attrs?.start) || 1;
      return [(node.content ?? []).map((item, index) => `${start + index}. ${textOf(item)}`).join("\n")];
    }
    case "horizontalRule":
      return ["———"];
    case "image": {
      const src = safeImageSrc(node.attrs?.src);
      return src ? [`[${typeof node.attrs?.alt === "string" && node.attrs.alt ? node.attrs.alt : src}]`] : [];
    }
    default:
      return [textOf(node)];
  }
};

// Plain-text alternative for the email: same content, readable without HTML.
export const renderNewsletterText = (body: EditorDocument): string =>
  blockText(body)
    .map((block) => block.trim())
    .filter(Boolean)
    .join("\n\n");
