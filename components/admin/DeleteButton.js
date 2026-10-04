"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ api, label = "Delete", confirmMessage = "Delete this item? This cannot be undone." }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (!window.confirm(confirmMessage)) return;
    setBusy(true);
    try {
      const res = await fetch(api, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        window.alert(data.error || "Delete failed.");
        return;
      }
      router.refresh();
    } catch (err) {
      window.alert(err.message || "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className="btn ghost dark" onClick={onClick} disabled={busy}>
      {busy ? "Deleting..." : label}
    </button>
  );
}
