"use client";
/* eslint-disable react-hooks/refs -- ref.current is only read inside event handlers and effects, never during render */
import { useEffect, useRef } from "react";

// Dependency-free rich text: contenteditable + execCommand. Input is trusted
// (only CMS admins can write it) and rendered as HTML on public pages.
export default function RichText({ value = "", onChange, placeholder = "Write the page content..." }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== value && document.activeElement !== el) {
      el.innerHTML = value || "";
    }
  }, [value]);

  function exec(cmd, arg = null) {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    if (ref.current) onChange?.(ref.current.innerHTML);
  }

  function onLink() {
    const url = window.prompt("Link URL (https://...)");
    if (url) exec("createLink", url);
  }

  const buttons = [
    { label: "B", title: "Bold", onMouseDown: () => exec("bold"), style: { fontWeight: 800 } },
    { label: "I", title: "Italic", onMouseDown: () => exec("italic"), style: { fontStyle: "italic" } },
    { label: "H2", title: "Heading", onMouseDown: () => exec("formatBlock", "<h2>") },
    { label: "H3", title: "Subheading", onMouseDown: () => exec("formatBlock", "<h3>") },
    { label: "P", title: "Paragraph", onMouseDown: () => exec("formatBlock", "<p>") },
    { label: "• List", title: "Bullet list", onMouseDown: () => exec("insertUnorderedList") },
    { label: "1. List", title: "Numbered list", onMouseDown: () => exec("insertOrderedList") },
    { label: "Link", title: "Insert link", onMouseDown: onLink },
    { label: "Quote", title: "Quote", onMouseDown: () => exec("formatBlock", "<blockquote>") },
    { label: "Clear", title: "Clear formatting", onMouseDown: () => exec("removeFormat") },
  ];

  return (
    <div>
      <div className="rte-bar">
        {buttons.map((b) => (
          <button
            key={b.label + b.title}
            type="button"
            title={b.title}
            style={b.style}
            onMouseDown={(e) => {
              e.preventDefault();
              b.onMouseDown();
            }}
          >
            {b.label}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        className="rte"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Content editor"
        data-placeholder={placeholder}
        onInput={(e) => onChange?.(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: value || "" }}
      />
    </div>
  );
}
