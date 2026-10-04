import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { getSetting } from "../../../lib/content";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BUYER_TYPES = new Set(["dealer", "team", "fleet", "other"]);

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const MAX_TRACKED = 5000;
const hits = new Map();

// Proxy-injected header first (spoof-resistant behind a proxy); XFF is only a
// fallback because it is client-controlled when no proxy sets the real IP.
function clientIp(request) {
  return (
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local"
  );
}

function rateLimited(ip) {
  const now = Date.now();
  // Bound memory: drop expired entries, then hard-cap regardless of spoofing.
  if (hits.size >= MAX_TRACKED) {
    for (const [key, list] of hits) {
      if (!list.some((t) => now - t < WINDOW_MS)) hits.delete(key);
    }
    if (hits.size >= MAX_TRACKED) hits.clear();
  }
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) return true;
  list.push(now);
  hits.delete(ip); // re-insert so insertion order tracks recency for the cap
  hits.set(ip, list);
  return false;
}

async function sendEmail({ name, email, company, buyerType, quantity, date, notes, suit, suitName }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return "skip"; // not configured: log only
  const to = process.env.EMAIL_TO || (await getSetting("contact.email")) || "trade@firstmoto.example";
  const from = process.env.RESEND_FROM || "First Moto <onboarding@resend.dev>";
  const text = [
    `Company: ${company}`,
    `Contact: ${name}`,
    `Email: ${email}`,
    `Buying as: ${buyerType}`,
    `Suit: ${suitName ? `${suitName} (${suit})` : "full line / general inquiry"}`,
    `Units: ${quantity || "(not specified)"}`,
    `Target delivery: ${date || "(not specified)"}`,
    "",
    notes || "(no notes)",
  ].join("\n");
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        reply_to: email,
        subject: `First Moto quote - ${company}${suitName ? ` (${suitName})` : ""}`,
        text,
      }),
    });
    if (!res.ok) {
      console.error("[quote-email]", res.status, await res.text());
      return "fail";
    }
    return "sent";
  } catch (err) {
    console.error("[quote-email]", err);
    return "fail";
  }
}

export async function POST(request) {
  if (rateLimited(clientIp(request))) {
    return NextResponse.json({ error: "Too many requests. Try again in a few minutes." }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (String(body?.website ?? "").trim()) {
    return NextResponse.json({ ok: true }); // honeypot: pretend success
  }

  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const company = String(body?.company ?? "").trim();
  const buyerType = String(body?.buyerType ?? "").trim();
  const quantity = String(body?.quantity ?? "").trim();
  const date = String(body?.date ?? "").trim();
  const notes = String(body?.notes ?? "").trim();
  const suit = String(body?.suit ?? "").trim();

  if (!name) return NextResponse.json({ error: "Contact name is required." }, { status: 400 });
  if (!company) return NextResponse.json({ error: "Company is required." }, { status: 400 });
  if (!emailRe.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (buyerType && !BUYER_TYPES.has(buyerType)) {
    return NextResponse.json({ error: "Unknown buyer type." }, { status: 400 });
  }
  if (quantity) {
    const n = Number(quantity);
    if (!Number.isInteger(n) || n < 1) {
      return NextResponse.json({ error: "Quantity must be a whole number of 1 or more." }, { status: 400 });
    }
  }
  if (date) {
    if (Number.isNaN(Date.parse(date))) return NextResponse.json({ error: "Pick a valid date." }, { status: 400 });
    const chosen = new Date(`${date}T23:59:59`);
    if (chosen < new Date()) return NextResponse.json({ error: "Pick a date in the future." }, { status: 400 });
  }

  const match = suit
    ? await prisma.product.findUnique({ where: { slug: suit }, select: { slug: true, name: true } })
    : null;
  if (suit && !match) return NextResponse.json({ error: "Unknown suit reference." }, { status: 400 });

  // No PII in logs: privacy policy promises 12-month retention, logs rarely comply.
  console.log(
    "[quote-request]",
    JSON.stringify({ suit: suit || null, buyerType: buyerType || null, quantity: quantity || null, dated: Boolean(date) }),
  );

  const message = [
    `Company: ${company}`,
    `Buying as: ${buyerType || "unspecified"}`,
    suit ? `Suit: ${match?.name} (${suit})` : "Suit: full line / general inquiry",
    quantity ? `Units: ${quantity}` : null,
    date ? `Target delivery: ${date}` : null,
    "",
    notes || "(no notes)",
  ]
    .filter((line) => line !== null)
    .join("\n");

  try {
    await prisma.contactSubmission.create({
      data: { type: "QUOTE", name, email, message },
    });
  } catch (err) {
    console.error("[quote-save]", err);
  }

  const result = await sendEmail({
    name,
    email,
    company,
    buyerType: buyerType || "unspecified",
    quantity,
    date,
    notes,
    suit,
    suitName: match?.name,
  });
  if (result === "fail") {
    return NextResponse.json(
      { error: "We could not send your request. Please email the trade desk directly instead." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
