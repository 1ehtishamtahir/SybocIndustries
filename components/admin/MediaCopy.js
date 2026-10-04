"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MediaCopy({ path }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(path);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button className="btn ghost dark" type="button" onClick={copy}>
      {copied ? "Copied!" : "Copy path"}
    </button>
  );
}
