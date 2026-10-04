"use client";
import Link from "next/link";

export default function Error({ error, reset }) {
  return (
    <main className="state-page">
      <h1>Something went wrong</h1>
      <p className="lede">{error?.message || "An unexpected error occurred."}</p>
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
