import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { readJson, bad, ok } from "@/lib/adminApi";

export async function GET() {
  const guard = await requireApiUser({ adminOnly: true });
  if (guard.response) return guard.response;
  const settings = await prisma.setting.findMany({ orderBy: [{ group: "asc" }, { key: "asc" }] });
  return ok({ settings });
}

export async function PUT(request) {
  const guard = await requireApiUser({ adminOnly: true });
  if (guard.response) return guard.response;

  const body = await readJson(request);
  if (!body || !body.settings || typeof body.settings !== "object") {
    return bad("Expected { settings: { key: value } }.");
  }

  const existing = await prisma.setting.findMany({ select: { key: true } });
  const known = new Set(existing.map((s) => s.key));
  const ignored = [];
  const updated = [];

  for (const [key, value] of Object.entries(body.settings)) {
    if (!known.has(key)) {
      ignored.push(key);
      continue;
    }
    await prisma.setting.upsert({
      where: { key },
      update: { value: value == null ? null : String(value) },
      create: { key, value: value == null ? null : String(value) },
    });
    updated.push(key);
  }

  return ok({ updated, ignored });
}
