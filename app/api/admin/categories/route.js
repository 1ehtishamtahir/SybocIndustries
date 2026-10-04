import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { readJson, bad, ok, slugify, optionalString } from "@/lib/adminApi";

export async function GET(request) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const where = type && (type === "BLOG" || type === "PRODUCT") ? { type } : {};
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, where });
  return ok({ categories });
}

export async function POST(request) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;

  const body = await readJson(request);
  if (!body) return bad("Invalid request body.");

  const name = String(body.name ?? "").trim();
  if (!name) return bad("Name is required.");
  const slug = slugify(body.slug || name);
  const type = body.type === "PRODUCT" ? "PRODUCT" : "BLOG";

  const clash = await prisma.category.findUnique({ where: { slug } });
  if (clash) return bad("A category with that slug already exists.", 409);

  const category = await prisma.category.create({
    data: { name, slug, type, description: optionalString(body.description, 500) },
  });
  return ok({ category });
}
