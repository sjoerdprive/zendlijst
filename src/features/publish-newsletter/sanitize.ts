import "server-only";
import DOMPurify from "isomorphic-dompurify";

/*
 * Uploaded HTML is emailed and shown in the archive, so it is cleaned on the
 * way in: scripts, event handlers, javascript: URLs, frames and forms are
 * removed while layout, styles and images survive. The archive additionally
 * serves files in a script-less sandbox (defence in depth).
 */
export const sanitizeNewsletterHtml = (html: string): string => {
  const clean = DOMPurify.sanitize(html, {
    WHOLE_DOCUMENT: true,
    ADD_TAGS: ["meta", "link", "title"],
    // No http-equiv: a meta refresh could send readers elsewhere.
    ADD_ATTR: ["target", "charset", "content"],
    FORBID_TAGS: ["form", "input", "button", "textarea", "select", "iframe", "frame", "object", "embed", "base"],
  });
  return `<!doctype html>\n${clean}`;
};

const PDF_SIGNATURE = Buffer.from("%PDF-");

// Rejects files that only pretend to be PDFs by their extension.
export const isPdf = (content: Buffer): boolean =>
  content.subarray(0, PDF_SIGNATURE.length).equals(PDF_SIGNATURE);
