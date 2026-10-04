"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function MediaUploader() {
  const router = useRouter();
  const fileRef = useRef(null);
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choose an image first.");
      return;
    }
    setBusy(true);
    setError("");
    setDone("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("alt", alt);
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      setDone(`Uploaded ${data.media.path}`);
      if (fileRef.current) fileRef.current.value = "";
      setAlt("");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={onSubmit} style={{ maxWidth: "40rem" }}>
      <p className="field">
        <label htmlFor="media-file">Image file</label>
        <input id="media-file" ref={fileRef} type="file" accept="image/*" required />
        <span className="hint">jpg, png, webp, gif, svg or avif — max 8 MB.</span>
      </p>
      <p className="field">
        <label htmlFor="media-alt">Alt text (optional)</label>
        <input id="media-alt" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe the image" />
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {done && (
        <p className="hint" role="status">
          {done}
        </p>
      )}
      <div className="admin-form-actions">
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Uploading..." : "Upload"}
        </button>
      </div>
    </form>
  );
}
