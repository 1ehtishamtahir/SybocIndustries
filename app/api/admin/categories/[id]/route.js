import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { readJson, bad, ok, slugify, optionalString } from "@/lib/adminApi";

async function resolve(params) {
  const { id } = await params;
  return prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true, posts: true } } } });
}

export async function GET(request, { params }) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;
  const category = await resolve(params);
  if (!category) return bad("Category not found.", 404);
  return ok({ category });
}

export async function PATCH(request, { params }) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;

  const current = await resolve(params);
  if (!current) return bad("Category not found.", 404);

  const body = await readJson(request);
  if (!body) return bad("Invalid request body.");

  const data = {};
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) return bad("Name is required.");
    data.name = name;
  }
  if (body.slug !== undefined) {
    const slug = slugify(body.slug);
    if (!slug) return bad("A valid slug is required.");
    if (slug !== current.slug) {
      const clash = await prisma.category.findUnique({ where: { slug } });
      if (clash) return bad("A category with that slug already exists.", 409);
    }
    data.slug = slug;
  }
  if (body.description !== undefined) data.description = optionalString(body.description, 500);

  const category = await prisma.category.update({ where: { id: current.id }, data });
  return ok({ category });
}

export async function DELETE(request, { params }) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;
  const category = await resolve(params);
  if (!category) return bad("Category not found.", 404);
  if (category._count.products > 0 || category._count.posts > 0) {
    return bad("Reassign items using this category before deleting it.", 409);
  }
  await prisma.category.delete({ where: { id: category.id } });
  return ok();
}
