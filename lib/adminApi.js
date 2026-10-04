import { NextResponse } from "next/server";

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function bad(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function ok(data = {}, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

export function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export const PUBLISH_VALUES = ["DRAFT", "PUBLISHED"];

export function cleanPublish(value, fallback = "DRAFT") {
  return PUBLISH_VALUES.includes(value) ? value : fallback;
}

export function optionalString(value, max = 100000) {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  return s.slice(0, max);
}

// Products: "details" arrive as a textarea (one line per bullet) or an array.
export function parseDetails(value) {
  if (Array.isArray(value)) return value.map((d) => String(d)).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((d) => d.trim())
      .filter(Boolean);
  }
  return [];
}

export function parseColors(value) {
  const c = value && typeof value === "object" ? value : {};
  return {
    bg: String(c.bg || "#000"),
    fg: String(c.fg || "#fff"),
    base: String(c.base || "#000"),
    accent: String(c.accent || "#e10600"),
    trim: String(c.trim || "#000"),
  };
}
