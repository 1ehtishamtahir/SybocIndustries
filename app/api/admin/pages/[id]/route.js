import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { readJson, bad, ok, slugify, cleanPublish, optionalString } from "@/lib/adminApi";
import { revalidateContent } from "@/lib/revalidate";

async function resolve(params) {
  const { id } = await params;
  return prisma.page.findUnique({ where: { id } });
}

export async function GET(request, { params }) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;
  const page = await resolve(params);
  if (!page) return bad("Page not found.", 404);
  return ok({ page });
}

export async function PATCH(request, { params }) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;

  const current = await resolve(params);
  if (!current) return bad("Page not found.", 404);

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
      const clash = await prisma.page.findUnique({ where: { slug } });
      if (clash) return bad("A page with that slug already exists.", 409);
    }
    data.slug = slug;
  }
  if (body.content !== undefined) data.content = String(body.content);
  if (body.excerpt !== undefined) data.excerpt = optionalString(body.excerpt, 500);
  if (body.seoTitle !== undefined) data.seoTitle = optionalString(body.seoTitle, 200);
  if (body.seoDescription !== undefined) data.seoDescription = optionalString(body.seoDescription, 500);
  if (body.keywords !== undefined) data.keywords = optionalString(body.keywords, 300);
  if (body.status !== undefined) {
    const status = cleanPublish(body.status, current.status);
    data.status = status;
    if (status === "PUBLISHED" && !current.publishedAt) data.publishedAt = new Date();
  }

  const page = await prisma.page.update({ where: { id: current.id }, data });
  revalidateContent(`/${current.slug}`, `/${page.slug}`);
  return ok({ page });
}

export async function DELETE(request, { params }) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;
  const page = await resolve(params);
  if (!page) return bad("Page not found.", 404);
  await prisma.page.delete({ where: { id: page.id } });
  revalidateContent(`/${page.slug}`);
  return ok();
}
