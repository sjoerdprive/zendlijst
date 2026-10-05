import "server-only";
import type { UploadedFile, UploadProblem } from "./types";
import { contentTypeForFileName, MAX_NEWSLETTER_BYTES } from "./utils";
import { isPdf, sanitizeNewsletterHtml } from "./sanitize";

// Validates an uploaded newsletter file and sanitises HTML on the way in.
export const readNewsletterUpload = async (
  file: FormDataEntryValue | null,
): Promise<{ ok: true; file: UploadedFile } | { ok: false; problem: UploadProblem }> => {
  if (!(file instanceof File) || file.size === 0) return { ok: false, problem: "chooseFile" };
  const contentType = contentTypeForFileName(file.name);
  if (!contentType) return { ok: false, problem: "unsupportedType" };
  if (file.size > MAX_NEWSLETTER_BYTES) return { ok: false, problem: "tooLarge" };

  const raw = Buffer.from(await file.arrayBuffer());
  if (contentType === "application/pdf" && !isPdf(raw)) return { ok: false, problem: "invalidPdf" };
  const content =
    contentType === "text/html" ? Buffer.from(sanitizeNewsletterHtml(raw.toString("utf8")), "utf8") : raw;
  return { ok: true, file: { fileName: file.name, contentType, content } };
};
