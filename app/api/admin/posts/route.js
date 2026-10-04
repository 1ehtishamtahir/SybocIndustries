import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { readJson, bad, ok, slugify, cleanPublish, optionalString } from "@/lib/adminApi";
import { revalidateContent } from "@/lib/revalidate";

export async function GET() {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, tags: true },
  });
  return ok({ posts });
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

  const clash = await prisma.blogPost.findUnique({ where: { slug } });
  if (clash) return bad("A post with that slug already exists.", 409);

  const status = cleanPublish(body.status);
  const tagIds = Array.isArray(body.tagIds) ? body.tagIds.filter((t) => typeof t === "string") : [];

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt: optionalString(body.excerpt, 500),
      content: String(body.content ?? ""),
      coverImage: optionalString(body.coverImage, 500),
      status,
      seoTitle: optionalString(body.seoTitle, 200),
      seoDescription: optionalString(body.seoDescription, 500),
      keywords: optionalString(body.keywords, 300),
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      authorId: guard.user.id,
      categoryId: optionalString(body.categoryId, 100),
      tags: tagIds.length ? { connect: tagIds.map((id) => ({ id })) } : undefined,
    },
    include: { tags: true },
  });

  revalidateContent("/blog", `/blog/${post.slug}`);
  return ok({ post });
}
