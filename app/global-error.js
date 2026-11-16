"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeContent: "center",
          textAlign: "center",
          background: "#000",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          padding: "2rem",
        }}
      >
        <div>
          <h1>Something went wrong</h1>
          <p>SYBOC INDUSTRIES hit an unexpected error.</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "#ff4a0a",
              color: "#fff",
              border: 0,
              padding: ".75rem 1.5rem",
              font: "inherit",
              fontWeight: 600,
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
