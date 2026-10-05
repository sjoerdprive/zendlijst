"use client";

import { useEffect } from "react";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { EMPTY_EDITOR_DOCUMENT, safeImageSrc, safeLinkHref, type EditorDocument } from "@/entities/newsletter";
import { useDictionary } from "@/shared/i18n";
import { cn } from "@/shared/lib";
import type { RichTextEditorProps } from "../types";

// Only what the email renderer supports (see entities/newsletter/editorDocument.ts).
const extensions = (placeholder: string) => [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    code: false,
    codeBlock: false,
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      protocols: ["http", "https", "mailto"],
      isAllowedUri: (url) => safeLinkHref(url) !== null,
    },
  }),
  // Pasted images only come along with a web address (no relative or data: URLs).
  Image.extend({
    parseHTML: () => [
      { tag: "img[src]", getAttrs: (element) => (safeImageSrc(element.getAttribute("src")) ? null : false) },
    ],
  }).configure({ allowBase64: false }),
  Placeholder.configure({ placeholder }),
];

// "example.com" → "https://example.com"; anything else must already be a web or mail link.
const normaliseUrl = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return safeLinkHref(withProtocol);
};

interface ToolButtonProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const ToolButton = ({ label, active, disabled, onClick, children }: ToolButtonProps) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    aria-pressed={active}
    disabled={disabled}
    // Keep the selection in the editor while clicking the toolbar.
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
    className={cn(
      "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm text-ink transition-colors hover:bg-brand-soft hover:text-brand disabled:opacity-40 disabled:hover:bg-transparent",
      active && "bg-brand-soft font-semibold text-brand",
    )}
  >
    {children}
  </button>
);

const Icon = ({ path }: { path: string }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const LINK_ICON = "M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7";
const UNLINK_ICON = `${LINK_ICON}M3 3l18 18`;
const IMAGE_ICON = "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15.5 9.5h.01";

const Divider = () => <span aria-hidden="true" className="mx-1 h-5 w-px bg-line" />;

const Toolbar = ({ editor }: { editor: Editor }) => {
  const t = useDictionary();
  const labels = t.editor.toolbar;
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      paragraph: current.isActive("paragraph"),
      heading2: current.isActive("heading", { level: 2 }),
      heading3: current.isActive("heading", { level: 3 }),
      bold: current.isActive("bold"),
      italic: current.isActive("italic"),
      underline: current.isActive("underline"),
      strike: current.isActive("strike"),
      bulletList: current.isActive("bulletList"),
      orderedList: current.isActive("orderedList"),
      blockquote: current.isActive("blockquote"),
      link: current.isActive("link"),
      canUndo: current.can().undo(),
      canRedo: current.can().redo(),
    }),
  });
  const chain = () => editor.chain().focus();

  const toggleLink = () => {
    if (state.link) {
      chain().extendMarkRange("link").unsetLink().run();
      return;
    }
    const answer = window.prompt(t.editor.linkPrompt, "https://");
    if (answer === null) return;
    const href = normaliseUrl(answer);
    if (!href) {
      window.alert(t.editor.invalidUrl);
      return;
    }
    if (editor.state.selection.empty) {
      chain().insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] }).run();
    } else {
      chain().extendMarkRange("link").setLink({ href }).run();
    }
  };

  const addImage = () => {
    const answer = window.prompt(t.editor.imagePrompt, "https://");
    if (answer === null) return;
    const src = safeImageSrc(answer);
    if (!src) {
      window.alert(t.editor.invalidUrl);
      return;
    }
    const alt = window.prompt(t.editor.imageAltPrompt, "") ?? "";
    chain().setImage({ src, alt }).run();
  };

  return (
    <div
      role="toolbar"
      aria-label={labels.label}
      className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-xl border-b border-line bg-surface-sunken/95 px-2 py-1.5 backdrop-blur"
    >
      <ToolButton label={labels.paragraph} active={state.paragraph} onClick={() => chain().setParagraph().run()}>
        ¶
      </ToolButton>
      <ToolButton label={labels.heading2} active={state.heading2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
        H2
      </ToolButton>
      <ToolButton label={labels.heading3} active={state.heading3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
        H3
      </ToolButton>
      <Divider />
      <ToolButton label={labels.bold} active={state.bold} onClick={() => chain().toggleBold().run()}>
        <strong>B</strong>
      </ToolButton>
      <ToolButton label={labels.italic} active={state.italic} onClick={() => chain().toggleItalic().run()}>
        <em className="font-serif">I</em>
      </ToolButton>
      <ToolButton label={labels.underline} active={state.underline} onClick={() => chain().toggleUnderline().run()}>
        <span className="underline">U</span>
      </ToolButton>
      <ToolButton label={labels.strike} active={state.strike} onClick={() => chain().toggleStrike().run()}>
        <span className="line-through">S</span>
      </ToolButton>
      <Divider />
      <ToolButton label={labels.bulletList} active={state.bulletList} onClick={() => chain().toggleBulletList().run()}>
        •≡
      </ToolButton>
      <ToolButton label={labels.orderedList} active={state.orderedList} onClick={() => chain().toggleOrderedList().run()}>
        1.
      </ToolButton>
      <ToolButton label={labels.blockquote} active={state.blockquote} onClick={() => chain().toggleBlockquote().run()}>
        “ ”
      </ToolButton>
      <ToolButton label={labels.horizontalRule} onClick={() => chain().setHorizontalRule().run()}>
        —
      </ToolButton>
      <Divider />
      <ToolButton label={state.link ? labels.unlink : labels.link} active={state.link} onClick={toggleLink}>
        <Icon path={state.link ? UNLINK_ICON : LINK_ICON} />
      </ToolButton>
      <ToolButton label={labels.image} onClick={addImage}>
        <Icon path={IMAGE_ICON} />
      </ToolButton>
      <Divider />
      <ToolButton label={labels.undo} disabled={!state.canUndo} onClick={() => chain().undo().run()}>
        ↶
      </ToolButton>
      <ToolButton label={labels.redo} disabled={!state.canRedo} onClick={() => chain().redo().run()}>
        ↷
      </ToolButton>
    </div>
  );
};

export const RichTextEditor = ({ initialContent, editable, onChange, label, placeholder }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: extensions(placeholder),
    content: initialContent ?? EMPTY_EDITOR_DOCUMENT,
    // Rendered on the client only; avoids a hydration mismatch.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "newsletter-editor min-h-80 px-4 py-4 focus:outline-none sm:px-6",
        "aria-label": label,
        "aria-multiline": "true",
        role: "textbox",
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.getJSON() as EditorDocument),
  });

  useEffect(() => {
    // No update event: toggling editability is not a content change.
    editor?.setEditable(editable, false);
  }, [editor, editable]);

  return (
    <div className="rounded-xl border border-line-strong bg-surface shadow-xs focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/25">
      {editor && editable ? <Toolbar editor={editor} /> : <div className="h-11 rounded-t-xl border-b border-line bg-surface-sunken" />}
      <EditorContent editor={editor} />
    </div>
  );
};
