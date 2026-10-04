import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { readJson, bad, ok, slugify, cleanPublish, optionalString } from "@/lib/adminApi";
import { revalidateContent } from "@/lib/revalidate";

export async function GET() {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;
  const pages = await prisma.page.findMany({ orderBy: { updatedAt: "desc" } });
  return ok({ pages });
}

export async function POST(request) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;

  const body = await readJson(request);
  if (!body) return bad("Invalid request body.");

  const title = String(body.title ?? "").trim();
  if (!title) return bad("Title is required.");
  const slug = slugify(body.slug || title);
  if (!slug) return bad("A valid slug is required.");

  const existing = await prisma.page.findUnique({ where: { slug } });
  if (existing) return bad("A page with that slug already exists.", 409);

  const status = cleanPublish(body.status);
  const page = await prisma.page.create({
    data: {
      title,
      slug,
      content: String(body.content ?? ""),
      excerpt: optionalString(body.excerpt, 500),
      status,
      seoTitle: optionalString(body.seoTitle, 200),
      seoDescription: optionalString(body.seoDescription, 500),
      keywords: optionalString(body.keywords, 300),
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      authorId: guard.user.id,
    },
  });

  revalidateContent(`/${page.slug}`);
  return ok({ page });
}
