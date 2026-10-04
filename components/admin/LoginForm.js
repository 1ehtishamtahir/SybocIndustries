"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Login failed.");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  return (
    <form className="admin-login-form" onSubmit={onSubmit} noValidate>
      <p className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required />
      </p>
      <p className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </p>
      {status === "error" && (
        <p className="form-error" role="alert">
          {message}
        </p>
      )}
      <button className="btn" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
