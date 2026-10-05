import { z } from "zod";
import type { EditorDocument, EditorNode } from "./types";

/*
 * The editor stores Tiptap JSON. Only the nodes and marks the toolbar offers
 * are accepted; anything else (pasted from elsewhere or crafted by hand) is
 * rejected on save. The renderer additionally ignores unknown attributes.
 */
export const EDITOR_NODES = [
  "doc",
  "paragraph",
  "text",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "horizontalRule",
  "hardBreak",
  "image",
] as const;

export const EDITOR_MARKS = ["bold", "italic", "underline", "strike", "link"] as const;

// Keeps saves small and the stored JSON bounded.
export const MAX_EDITOR_DOCUMENT_CHARS = 500_000;
const MAX_DEPTH = 12;

const attrsSchema = z.record(z.string(), z.unknown()).optional();

const markSchema = z.object({
  type: z.enum(EDITOR_MARKS),
  attrs: attrsSchema,
});

const nodeSchema: z.ZodType<EditorNode> = z.lazy(() =>
  z.object({
    type: z.enum(EDITOR_NODES),
    attrs: attrsSchema,
    content: z.array(nodeSchema).optional(),
    marks: z.array(markSchema).optional(),
    text: z.string().optional(),
  }),
);

const depthOf = (node: EditorNode): number =>
  1 + Math.max(0, ...(node.content ?? []).map(depthOf));

export const parseEditorDocument = (raw: unknown): EditorDocument | null => {
  if (typeof raw !== "string" || raw.length > MAX_EDITOR_DOCUMENT_CHARS) return null;
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }
  const parsed = nodeSchema.safeParse(json);
  if (!parsed.success || parsed.data.type !== "doc" || depthOf(parsed.data) > MAX_DEPTH) return null;
  return parsed.data as EditorDocument;
};

export const EMPTY_EDITOR_DOCUMENT: EditorDocument = { type: "doc", content: [{ type: "paragraph" }] };

// True when the document holds visible text or an image.
export const hasEditorContent = (node: EditorNode): boolean =>
  (node.type === "text" && Boolean(node.text?.trim())) ||
  node.type === "image" ||
  (node.content ?? []).some(hasEditorContent);

// Only web and mail links survive; everything else (javascript:, data:, …) is dropped.
export const safeLinkHref = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const href = value.trim();
  return /^(https?:\/\/|mailto:)/i.test(href) ? href : null;
};

export const safeImageSrc = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const src = value.trim();
  return /^https?:\/\//i.test(src) ? src : null;
};
