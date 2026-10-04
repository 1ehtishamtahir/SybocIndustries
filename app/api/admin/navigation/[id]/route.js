import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { readJson, bad, ok } from "@/lib/adminApi";
import { revalidateContent } from "@/lib/revalidate";

async function resolve(params) {
  const { id } = await params;
  return prisma.navigationItem.findUnique({ where: { id } });
}

export async function GET(request, { params }) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;
  const item = await resolve(params);
  if (!item) return bad("Navigation item not found.", 404);
  return ok({ item });
}

export async function PATCH(request, { params }) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;

  const current = await resolve(params);
  if (!current) return bad("Navigation item not found.", 404);

  const body = await readJson(request);
  if (!body) return bad("Invalid request body.");

  const data = {};
  if (body.label !== undefined) {
    const label = String(body.label).trim();
    if (!label) return bad("Label is required.");
    data.label = label.slice(0, 80);
  }
  if (body.href !== undefined) {
    const href = String(body.href).trim();
    if (!href) return bad("A link (href) is required.");
    data.href = href.slice(0, 500);
  }
  if (body.menu !== undefined) data.menu = body.menu === "FOOTER" ? "FOOTER" : "HEADER";
  if (body.isCta !== undefined) data.isCta = Boolean(body.isCta);
  if (body.visible !== undefined) data.visible = Boolean(body.visible);
  if (body.order !== undefined && Number.isFinite(Number(body.order))) data.order = Number(body.order);

  const item = await prisma.navigationItem.update({ where: { id: current.id }, data });
  revalidateContent("/");
  return ok({ item });
}

export async function DELETE(request, { params }) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;
  const item = await resolve(params);
  if (!item) return bad("Navigation item not found.", 404);
  await prisma.navigationItem.delete({ where: { id: item.id } });
  revalidateContent("/");
  return ok();
}
