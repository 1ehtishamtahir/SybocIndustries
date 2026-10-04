"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DeleteButton from "./DeleteButton";

function NavSection({ menu, items, onSaved }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [isCta, setIsCta] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [editHref, setEditHref] = useState("");

  async function onCreate(e) {
    e.preventDefault();
    if (!label.trim() || !href.trim()) return;
    setBusy(true);
    setError("");
    try {
      const maxOrder = items.reduce((m, i) => Math.max(m, i.order), 0);
      const res = await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, href, menu, isCta, order: maxOrder + 1, visible: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Creating failed.");
      setLabel("");
      setHref("");
      setIsCta(false);
      router.refresh();
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onSave(id) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/navigation/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: editLabel, href: editHref }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Saving failed.");
      setEditId(null);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggle(item, field) {
    await fetch(`/api/admin/navigation/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !item[field] }),
    });
    router.refresh();
  }

  return (
    <section style={{ marginBottom: "2.5rem" }}>
      <h2 style={{ fontSize: "1rem", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: ".8rem", color: "var(--mute)" }}>
        {menu === "HEADER" ? "Header menu" : "Footer menu"}
      </h2>

      <form className="form-row" onSubmit={onCreate} style={{ alignItems: "flex-end", marginBottom: "1rem" }}>
        <p className="field" style={{ flex: 1 }}>
          <label htmlFor={`${menu}-label`}>Label</label>
          <input id={`${menu}-label`} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Dealers" />
        </p>
        <p className="field" style={{ flex: 1 }}>
          <label htmlFor={`${menu}-href`}>Link</label>
          <input id={`${menu}-href`} value={href} onChange={(e) => setHref(e.target.value)} placeholder="/faq or https://..." />
        </p>
        <p className="field">
          <label htmlFor={`${menu}-cta`}>CTA style</label>
          <span style={{ display: "flex", gap: ".4rem", alignItems: "center", minHeight: "2.6rem" }}>
            <input id={`${menu}-cta`} type="checkbox" checked={isCta} onChange={(e) => setIsCta(e.target.checked)} />
            <span className="hint" style={{ margin: 0 }}>
              Red button look
            </span>
          </span>
        </p>
        <button className="btn" type="submit" disabled={busy}>
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
              <th>Label</th>
              <th>Link</th>
              <th>Order</th>
              <th>Visible</th>
              <th>CTA</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  {editId === item.id ? (
                    <input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} aria-label="Label" />
                  ) : (
                    item.label
                  )}
                </td>
                <td className="muted-cell">
                  {editId === item.id ? (
                    <input value={editHref} onChange={(e) => setEditHref(e.target.value)} aria-label="Link" />
                  ) : (
                    item.href
                  )}
                </td>
                <td className="muted-cell">{item.order}</td>
                <td>
                  <button className="btn ghost dark" type="button" onClick={() => toggle(item, "visible")}>
                    {item.visible ? "Visible" : "Hidden"}
                  </button>
                </td>
                <td>
                  <button className="btn ghost dark" type="button" onClick={() => toggle(item, "isCta")}>
                    {item.isCta ? "CTA" : "Normal"}
                  </button>
                </td>
                <td>
                  <div className="row-actions">
                    {editId === item.id ? (
                      <>
                        <button className="btn" type="button" disabled={busy} onClick={() => onSave(item.id)}>
                          Save
                        </button>
                        <button className="btn ghost dark" type="button" onClick={() => setEditId(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn ghost dark"
                          type="button"
                          onClick={() => {
                            setEditId(item.id);
                            setEditLabel(item.label);
                            setEditHref(item.href);
                          }}
                        >
                          Edit
                        </button>
                        <DeleteButton api={`/api/admin/navigation/${item.id}`} confirmMessage={`Remove "${item.label}" from the menu?`} />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="muted-cell">
                  No items in this menu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function NavigationEditor({ items = [] }) {
  const header = items.filter((i) => i.menu === "HEADER").sort((a, b) => a.order - b.order);
  const footer = items.filter((i) => i.menu === "FOOTER").sort((a, b) => a.order - b.order);

  return (
    <div>
      <NavSection menu="HEADER" items={header} />
      <NavSection menu="FOOTER" items={footer} />
    </div>
  );
}
