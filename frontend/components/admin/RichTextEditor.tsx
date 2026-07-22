"use client";

import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Undo,
  Redo,
} from "lucide-react";

interface RichTextEditorProps {
  value: string; // HTML — same string that used to live in the textarea
  onChange: (html: string) => void;
  placeholder?: string;
}

/**
 * Lightweight contentEditable-based rich text editor. No external editor
 * library — this repo doesn't have one installed yet, and the article
 * body was already stored/rendered as raw HTML (see the old textarea's
 * placeholder: "HTML or Markdown — rendered on the public site"), so a
 * thin wrapper around document.execCommand is enough to cover
 * bold/italic/headings/lists/links without adding a dependency.
 *
 * NOTE: whatever HTML this produces is stored as-is in Article.body and
 * rendered on the public site — make sure the public article page
 * sanitizes it (e.g. with `sanitize-html` or DOMPurify) before rendering,
 * the same way any HTML coming from a rich text editor should be.
 */
export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Only push `value` into the DOM on first mount / when it changes from
  // outside (e.g. loading an existing article) — never on every keystroke,
  // or the cursor jumps to the end on each render.
  useEffect(() => {
    if (ref.current && (isFirstRender.current || ref.current.innerHTML !== value)) {
      ref.current.innerHTML = value || "";
      isFirstRender.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function exec(command: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    onChange(ref.current?.innerHTML || "");
  }

  function insertLink() {
    const url = window.prompt("Link URL");
    if (url) exec("createLink", url);
  }

  const buttons: { icon: typeof Bold; label: string; action: () => void }[] = [
    { icon: Bold, label: "Bold", action: () => exec("bold") },
    { icon: Italic, label: "Italic", action: () => exec("italic") },
    { icon: Heading2, label: "Heading", action: () => exec("formatBlock", "h2") },
    { icon: Quote, label: "Quote", action: () => exec("formatBlock", "blockquote") },
    { icon: List, label: "Bullet list", action: () => exec("insertUnorderedList") },
    { icon: ListOrdered, label: "Numbered list", action: () => exec("insertOrderedList") },
    { icon: LinkIcon, label: "Link", action: insertLink },
    { icon: Undo, label: "Undo", action: () => exec("undo") },
    { icon: Redo, label: "Redo", action: () => exec("redo") },
  ];

  return (
    <div className="rounded border border-gray-200">
      <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-1.5">
        {buttons.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            type="button"
            title={label}
            onClick={action}
            className="rounded p-1.5 text-gray-600 hover:bg-gray-200"
          >
            <Icon size={16} />
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML || "")}
        onBlur={() => onChange(ref.current?.innerHTML || "")}
        data-placeholder={placeholder}
        className="prose prose-sm min-h-[240px] max-w-none px-3 py-2 text-sm focus:outline-none empty:before:text-gray-400 empty:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}
