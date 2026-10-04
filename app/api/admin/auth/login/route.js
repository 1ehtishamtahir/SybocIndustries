import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../../lib/db";
import { createSessionCookie } from "../../../../../lib/auth";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 20;
const MAX_TRACKED = 5000;
const hits = new Map();

function clientIp(request) {
  return (
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local"
  );
}

function rateLimited(ip) {
  const now = Date.now();
  if (hits.size >= MAX_TRACKED) {
    for (const [key, list] of hits) {
      if (!list.some((t) => now - t < WINDOW_MS)) hits.delete(key);
    }
    if (hits.size >= MAX_TRACKED) hits.clear();
  }
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) return true;
  list.push(now);
  hits.delete(ip);
  hits.set(ip, list);
  return false;
}

export async function POST(request) {
  if (rateLimited(clientIp(request))) {
    return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  // Same error whether the user exists or not: no account enumeration.
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!ok) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await Promise.all([
    createSessionCookie(user),
    prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }),
  ]);
  return NextResponse.json({ ok: true, user: { name: user.name, role: user.role } });
}
