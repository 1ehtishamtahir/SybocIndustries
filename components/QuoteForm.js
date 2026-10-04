"use client";
import { useEffect, useRef, useState } from "react";

const fields = [
  { name: "name", label: "Contact name", type: "text", autoComplete: "name" },
  { name: "company", label: "Company", type: "text", autoComplete: "organization" },
  { name: "email", label: "Business email", type: "email", autoComplete: "email" },
];

const buyerTypes = [
  ["dealer", "Dealer or distributor"],
  ["team", "Race team or track school"],
  ["fleet", "Corporate or fleet"],
  ["other", "Other"],
];

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function QuoteForm({ initialSuit, products = [] }) {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const dateRef = useRef(null);
  const suitRef = useRef(null);
  const notesRef = useRef(null);

  // Set the date floor as a DOM attribute after mount (client-local calendar
  // day) so server and client render identical markup.
  useEffect(() => {
    if (dateRef.current) dateRef.current.min = todayIso();
  }, []);

  useEffect(() => {
    if (typeof initialSuit === "string" && initialSuit) return;
    const param = new URLSearchParams(window.location.search).get("suit");
    const m = products.find((s) => s.slug === param);
    if (!m) return;
    if (suitRef.current) suitRef.current.value = m.slug;
    if (notesRef.current && !notesRef.current.value) notesRef.current.value = `Interested in ${m.name}`;
  }, [initialSuit, products]);

  const match = products.find((s) => s.slug === (typeof initialSuit === "string" ? initialSuit : ""));
  const suit = match?.slug ?? "";

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const values = Object.fromEntries(new FormData(form));

    // Mirror the server rules so common mistakes fail fast, without a round-trip.
    if (!String(values.name ?? "").trim()) {
      setStatus("error");
      setMessage("Contact name is required.");
      return;
    }
    if (!String(values.company ?? "").trim()) {
      setStatus("error");
      setMessage("Company is required.");
      return;
    }
    if (!emailRe.test(String(values.email ?? "").trim())) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      return;
    }
    if (values.date && values.date < todayIso()) {
      setStatus("error");
      setMessage("Pick a date in the future.");
      return;
    }
    if (values.quantity && (!Number.isInteger(Number(values.quantity)) || Number(values.quantity) < 1)) {
      setStatus("error");
      setMessage("Quantity must be a whole number of 1 or more.");
      return;
    }

    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        signal: typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(15000) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Try again.");
      setStatus("done");
      form.reset();
    } catch (err) {
      setStatus("error");
      setMessage(
        err?.name === "TimeoutError" || err?.name === "AbortError"
          ? "The request timed out. Try again."
          : err.message,
      );
    }
  }

  if (status === "done") {
    return (
      <div className="form-ok" role="status">
        <h3>Quote request received</h3>
        <p>We will come back with pricing, lead time and any volume breaks within one working day.</p>
        <button type="button" className="btn ghost" onClick={() => setStatus("idle")}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      {fields.map((f) => (
        <p className="field" key={f.name}>
          <label htmlFor={f.name}>{f.label}</label>
          <input
            id={f.name}
            name={f.name}
            type={f.type}
            autoComplete={f.autoComplete}
            required
          />
        </p>
      ))}
      <p className="field">
        <label htmlFor="buyerType">Buying as</label>
        <select id="buyerType" name="buyerType" defaultValue="dealer" required>
          {buyerTypes.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </p>
      <p className="field">
        <label htmlFor="suit">Suits of interest</label>
        <select id="suit" name="suit" defaultValue={suit} ref={suitRef}>
          <option value="">The full line (general inquiry)</option>
          {products.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </p>
      <p className="field">
        <label htmlFor="quantity">Units (optional)</label>
        <input id="quantity" name="quantity" type="number" min={1} step={1} inputMode="numeric" />
      </p>
      <p className="field">
        <label htmlFor="date">Target delivery (optional)</label>
        <input id="date" name="date" type="date" ref={dateRef} />
      </p>
      <p className="field">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          ref={notesRef}
          defaultValue={match ? `Interested in ${match.name}` : ""}
          placeholder="Model mix, sizing, branding, territory, anything we should know"
        />
      </p>
      <p className="hp" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </p>
      {status === "error" && (
        <p className="form-error" role="alert">
          {message}
        </p>
      )}
      <noscript>
        <p className="form-error">This form needs JavaScript — or email the trade desk directly.</p>
      </noscript>
      <button className="btn" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : "Request a quote"}
      </button>
    </form>
  );
}
