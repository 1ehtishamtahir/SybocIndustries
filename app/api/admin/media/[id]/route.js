import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { readJson, ok, bad } from "@/lib/adminApi";
import { unlink } from "node:fs/promises";
import path from "node:path";

async function resolve(params) {
  const { id } = await params;
  return prisma.media.findUnique({ where: { id } });
}

export async function GET(request, { params }) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;
  const media = await resolve(params);
  if (!media) return bad("Media not found.", 404);
  return ok({ media });
}

export async function PATCH(request, { params }) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;
  const media = await resolve(params);
  if (!media) return bad("Media not found.", 404);

  const body = await readJson(request);
  if (!body) return bad("Invalid request body.");
  const data = {};
  if (body.alt !== undefined) data.alt = String(body.alt).trim().slice(0, 300) || null;

  const updated = await prisma.media.update({ where: { id: media.id }, data });
  return ok({ media: updated });
}

export async function DELETE(request, { params }) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;
  const media = await resolve(params);
  if (!media) return bad("Media not found.", 404);

  await prisma.media.delete({ where: { id: media.id } });
  try {
    await unlink(path.join(process.cwd(), "public", media.path));
  } catch {
    // File already gone — the DB record is the source of truth.
  }
  return ok();
}
