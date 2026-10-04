"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DeleteButton from "./DeleteButton";

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export default function TaxonomyManager({ kind, items = [] }) {
  const router = useRouter();
  const basePath = `/api/admin/${kind}`;
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  async function onCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(basePath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Creating failed.");
      setName("");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onRename(id) {
    if (!editName.trim()) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${basePath}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Renaming failed.");
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-form" style={{ maxWidth: "48rem" }}>
      <form className="form-row" onSubmit={onCreate} style={{ alignItems: "flex-end" }}>
        <p className="field" style={{ flex: 1 }}>
          <label htmlFor={`new-${kind}`}>New {kind === "tags" ? "tag" : "category"} name</label>
          <input id={`new-${kind}`} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Events" />
        </p>
        <button className="btn" type="submit" disabled={busy || !name.trim()}>
          Add
        </button>
      </form>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Used by</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  {editingId === item.id ? (
                    <span style={{ display: "flex", gap: ".5rem" }}>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        aria-label="New name"
                      />
                      <button className="btn" type="button" disabled={busy} onClick={() => onRename(item.id)}>
                        Save
                      </button>
                      <button className="btn ghost dark" type="button" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </span>
                  ) : (
                    item.name
                  )}
                </td>
                <td className="muted-cell">{item.slug}</td>
                <td className="muted-cell">{item._count ? item._count.posts ?? item._count.products ?? 0 : 0}</td>
                <td>
                  <div className="row-actions">
                    <button
                      className="btn ghost dark"
                      type="button"
                      onClick={() => {
                        setEditingId(item.id);
                        setEditName(item.name);
                      }}
                    >
                      Rename
                    </button>
                    <DeleteButton api={`${basePath}/${item.id}`} confirmMessage={`Delete "${item.name}"?`} />
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="muted-cell">
                  Nothing here yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
