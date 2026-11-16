"use client";
import Link from "next/link";

export default function Error({ error, reset }) {
  return (
    <main className="state-page error-state">
      <p className="crumb">SYBOC / System error</p>
      <h1>Something went wrong</h1>
      <p className="lede">We could not load this page right now. Please try again or return to SYBOC INDUSTRIES.</p>
      <div className="row">
        <button className="btn" type="button" onClick={() => reset()}>
          Try again
        </button>
        <Link className="btn ghost" href="/">
          Back home
        </Link>
      </div>
    </main>
  );
}
