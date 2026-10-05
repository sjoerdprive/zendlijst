import "server-only";
import sanitizeHtml from "sanitize-html";

/*
 * Uploaded HTML is emailed and shown in the archive, so it is cleaned on the
 * way in: only an allowlist of layout tags and attributes survives. Scripts,
 * event handlers, javascript: URLs, frames, forms and meta refreshes are
 * removed while tables, inline styles, <style> blocks and images stay. The
 * archive additionally serves files in a script-less sandbox (defence in depth).
 *
 * sanitize-html parses with htmlparser2 and needs no DOM, so it is bundled with
 * the app (jsdom, which DOMPurify needs on the server, fails to load on Vercel).
 */
// Legacy ways to run script from CSS (javascript: URLs, IE expressions/behaviors).
const UNSAFE_CSS = /(?:java|vb)script\s*:|expression\s*\(|behavior\s*:|-moz-binding/i;
const UNSAFE_CSS_GLOBAL = new RegExp(UNSAFE_CSS.source, "gi");

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    "html",
    "head",
    "body",
    "title",
    "meta",
    "link",
    "style",
    "img",
    "center",
    "font",
    "span",
    "u",
    "s",
    "del",
    "ins",
    "sup",
    "sub",
    "small",
    "big",
    "picture",
    "source",
  ],
  allowedAttributes: {
    "*": [
      "style",
      "class",
      "id",
      "align",
      "valign",
      "width",
      "height",
      "bgcolor",
      "background",
      "border",
      "cellpadding",
      "cellspacing",
      "colspan",
      "rowspan",
      "dir",
      "lang",
      "title",
      "role",
      "aria-*",
    ],
    a: ["href", "name", "target", "rel"],
    img: ["src", "srcset", "alt", "loading"],
    source: ["srcset", "media", "type"],
    font: ["color", "face", "size"],
    ol: ["start", "type"],
    // No http-equiv: a meta refresh could send readers elsewhere.
    meta: ["charset", "name", "content"],
    link: ["href", "rel", "type", "media"],
    style: ["type", "media"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https", "data"], source: ["http", "https", "data"] },
  allowProtocolRelative: false,
  // <style> blocks are common in email HTML; their content is raw CSS and
  // cannot run script under the archive's sandbox and CSP.
  allowVulnerableTags: true,
  // Content of these is dropped entirely, not kept as text.
  nonTextTags: ["script", "noscript", "textarea", "option", "iframe", "object", "embed", "template"],
  transformTags: {
    "*": (tagName, attribs) => {
      const unsafe = attribs.style !== undefined && UNSAFE_CSS.test(attribs.style);
      return {
        tagName,
        attribs: unsafe ? Object.fromEntries(Object.entries(attribs).filter(([name]) => name !== "style")) : attribs,
      };
    },
  },
};

const cleanStyleBlocks = (html: string): string =>
  html.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (_match, open: string, css: string, close: string) =>
    `${open}${css.replace(UNSAFE_CSS_GLOBAL, "")}${close}`,
  );

export const sanitizeNewsletterHtml = (html: string): string =>
  `<!doctype html>\n${cleanStyleBlocks(sanitizeHtml(html, OPTIONS))}`;

const PDF_SIGNATURE = Buffer.from("%PDF-");

// Rejects files that only pretend to be PDFs by their extension.
export const isPdf = (content: Buffer): boolean =>
  content.subarray(0, PDF_SIGNATURE.length).equals(PDF_SIGNATURE);
