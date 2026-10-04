"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserForm({ user = null, selfId = null }) {
  const router = useRouter();
  const editing = Boolean(user);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState(user?.role ?? "EDITOR");
  const [password, setPassword] = useState("");

  const isSelf = user && selfId && user.id === selfId;

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const payload = { name, email, role };
    if (password) payload.password = password;
    try {
      const res = await fetch(editing ? `/api/admin/users/${user.id}` : "/api/admin/users", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Saving failed.");
      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  return (
    <form className="admin-form" onSubmit={onSubmit} style={{ maxWidth: "40rem" }}>
      <div className="form-row">
        <p className="field">
          <label htmlFor="u-name">Name</label>
          <input id="u-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </p>
        <p className="field">
          <label htmlFor="u-email">Email</label>
          <input id="u-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </p>
      </div>

      <div className="form-row">
        <p className="field">
          <label htmlFor="u-role">Role</label>
          <select id="u-role" value={role} onChange={(e) => setRole(e.target.value)} disabled={isSelf}>
            <option value="EDITOR">Editor — manages content</option>
            <option value="ADMIN">Admin — full access incl. users &amp; settings</option>
          </select>
          {isSelf && <span className="hint">You cannot change your own role.</span>}
        </p>
        <p className="field">
          <label htmlFor="u-password">{editing ? "New password (optional)" : "Password"}</label>
          <input
            id="u-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!editing}
            minLength={8}
            autoComplete="new-password"
          />
          <span className="hint">Minimum 8 characters.</span>
        </p>
      </div>

      {status === "error" && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="admin-form-actions">
        <button className="btn" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Saving..." : editing ? "Save changes" : "Create user"}
        </button>
        <button className="btn ghost dark" type="button" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}
