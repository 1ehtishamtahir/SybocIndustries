import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { readJson, bad, ok, slugify, cleanPublish, optionalString } from "@/lib/adminApi";
import { revalidateContent } from "@/lib/revalidate";

async function resolve(params) {
  const { id } = await params;
  return prisma.blogPost.findUnique({ where: { id }, include: { tags: true } });
}

export async function GET(request, { params }) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;
  const post = await resolve(params);
  if (!post) return bad("Post not found.", 404);
  return ok({ post });
}

export async function PATCH(request, { params }) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;

  const current = await resolve(params);
  if (!current) return bad("Post not found.", 404);

  const body = await readJson(request);
  if (!body) return bad("Invalid request body.");

  const data = {};
  if (body.title !== undefined) {
    const title = String(body.title).trim();
    if (!title) return bad("Title is required.");
    data.title = title;
  }
  if (body.slug !== undefined) {
    const slug = slugify(body.slug);
    if (!slug) return bad("A valid slug is required.");
    if (slug !== current.slug) {
      const clash = await prisma.blogPost.findUnique({ where: { slug } });
      if (clash) return bad("A post with that slug already exists.", 409);
    }
    data.slug = slug;
  }
  if (body.excerpt !== undefined) data.excerpt = optionalString(body.excerpt, 500);
  if (body.content !== undefined) data.content = String(body.content);
  if (body.coverImage !== undefined) data.coverImage = optionalString(body.coverImage, 500);
  if (body.categoryId !== undefined) data.categoryId = optionalString(body.categoryId, 100);
  if (body.seoTitle !== undefined) data.seoTitle = optionalString(body.seoTitle, 200);
  if (body.seoDescription !== undefined) data.seoDescription = optionalString(body.seoDescription, 500);
  if (body.keywords !== undefined) data.keywords = optionalString(body.keywords, 300);
  if (Array.isArray(body.tagIds)) {
    data.tags = { set: body.tagIds.filter((t) => typeof t === "string").map((id) => ({ id })) };
  }
  if (body.status !== undefined) {
    const status = cleanPublish(body.status, current.status);
    data.status = status;
    if (status === "PUBLISHED" && !current.publishedAt) data.publishedAt = new Date();
  }

  const post = await prisma.blogPost.update({
    where: { id: current.id },
    data,
    include: { tags: true },
  });
  revalidateContent("/blog", `/blog/${current.slug}`, `/blog/${post.slug}`);
  return ok({ post });
}

export async function DELETE(request, { params }) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;
  const post = await resolve(params);
  if (!post) return bad("Post not found.", 404);
  await prisma.blogPost.delete({ where: { id: post.id } });
  revalidateContent("/blog", `/blog/${post.slug}`);
  return ok();
}
