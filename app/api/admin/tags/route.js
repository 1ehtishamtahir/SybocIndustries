import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { readJson, bad, ok, slugify } from "@/lib/adminApi";

export async function GET() {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });
  return ok({ tags });
}

export async function POST(request) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;

  const body = await readJson(request);
  if (!body) return bad("Invalid request body.");

  const name = String(body.name ?? "").trim();
  if (!name) return bad("Name is required.");
  const slug = slugify(body.slug || name);

  const clash = await prisma.tag.findUnique({ where: { slug } });
  if (clash) return bad("A tag with that slug already exists.", 409);

  const tag = await prisma.tag.create({ data: { name, slug } });
  return ok({ tag });
}
