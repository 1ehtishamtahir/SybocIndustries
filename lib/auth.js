import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "./db.js";

const COOKIE_NAME = "fm_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set. Add it to .env (see .env.example).");
  }
  return secret;
}

function signature(body) {
  return createHmac("sha256", getSecret()).update(body).digest("base64url");
}

export function encodeSession(payload) {
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Date.now() + MAX_AGE_SECONDS * 1000 }),
  ).toString("base64url");
  return `${body}.${signature(body)}`;
}

export function decodeSession(token) {
  if (!token || typeof token !== "string") return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = Buffer.from(signature(body));
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload?.sub || typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createSessionCookie(user) {
  const store = await cookies();
  store.set(COOKIE_NAME, encodeSession({ sub: user.id, role: user.role }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const store = await cookies();
  const payload = decodeSession(store.get(COOKIE_NAME)?.value);
  if (!payload) return null;
  const user = await prisma.adminUser.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, role: true },
  });
  return user;
}

// Page guard: used by the admin dashboard layout and admin-only pages.
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/admin");
  return user;
}

// API guard: returns { user } or { response } with a ready 401/403 JSON body.
export async function requireApiUser({ adminOnly = false } = {}) {
  const user = await getCurrentUser();
  if (!user) {
    return {
      response: NextResponse.json({ error: "Authentication required." }, { status: 401 }),
    };
  }
  if (adminOnly && user.role !== "ADMIN") {
    return {
      response: NextResponse.json({ error: "Admin access required." }, { status: 403 }),
    };
  }
  return { user };
}
