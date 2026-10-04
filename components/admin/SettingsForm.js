"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

function looksJson(key, value) {
  if (/heroSlides|hours|notes|socials|links/i.test(key)) return true;
  const v = String(value ?? "").trim();
  return v.startsWith("[") || v.startsWith("{");
}

export default function SettingsForm({ settings = [] }) {
  const router = useRouter();
  const [values, setValues] = useState(() =>
    Object.fromEntries(settings.map((s) => [s.key, s.value ?? ""]))
  );
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const groups = [];
  for (const s of settings) {
    let g = groups.find((x) => x.group === s.group);
    if (!g) {
      g = { group: s.group, fields: [] };
      groups.push(g);
    }
    g.fields.push(s);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    setNote("");

    for (const s of settings) {
      const v = values[s.key] ?? "";
      if (looksJson(s.key, v)) {
        try {
          JSON.parse(v);
        } catch {
          setStatus("error");
          setError(`${s.label || s.key}: value must be valid JSON.`);
          return;
        }
      }
    }

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: values }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Saving failed.");
      setNote("Settings saved. Public pages reflect changes immediately.");
      setStatus("idle");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      {groups.map((g) => (
        <section key={g.group} style={{ marginBottom: "1.5rem" }}>
          <h2
            style={{
              fontSize: ".85rem",
              textTransform: "uppercase",
              letterSpacing: ".07em",
              color: "var(--mute)",
              marginBottom: ".8rem",
              borderBottom: "1px solid var(--edge)",
              paddingBottom: ".5rem",
            }}
          >
            {g.group}
          </h2>
          {g.fields.map((s) => (
            <p className="field" key={s.key} style={{ marginBottom: "1rem" }}>
              <label htmlFor={`setting-${s.key}`}>{s.label || s.key}</label>
              {looksJson(s.key, s.value) ? (
                <textarea
                  id={`setting-${s.key}`}
                  rows={s.key.includes("heroSlides") ? 8 : 4}
                  value={values[s.key] ?? ""}
                  onChange={(e) => setValues({ ...values, [s.key]: e.target.value })}
                  spellCheck={false}
                />
              ) : (
                <input
                  id={`setting-${s.key}`}
                  value={values[s.key] ?? ""}
                  onChange={(e) => setValues({ ...values, [s.key]: e.target.value })}
                />
              )}
              {s.description && <span className="hint">{s.description}</span>}
              <span className="hint" style={{ opacity: 0.5 }}>
                {s.key}
              </span>
            </p>
          ))}
        </section>
      ))}

      {status === "error" && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {note && (
        <p className="hint" role="status">
          {note}
        </p>
      )}

      <div className="admin-form-actions">
        <button className="btn" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Saving..." : "Save settings"}
        </button>
      </div>
    </form>
  );
}
