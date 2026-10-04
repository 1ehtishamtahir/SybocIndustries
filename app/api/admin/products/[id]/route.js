import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { readJson, bad, ok, slugify, cleanPublish, optionalString, parseDetails, parseColors } from "@/lib/adminApi";
import { revalidateContent } from "@/lib/revalidate";

async function resolve(params) {
  const { id } = await params;
  return prisma.product.findUnique({ where: { id } });
}

export async function GET(request, { params }) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;
  const product = await resolve(params);
  if (!product) return bad("Product not found.", 404);
  return ok({ product });
}

export async function PATCH(request, { params }) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;

  const current = await resolve(params);
  if (!current) return bad("Product not found.", 404);

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
      const clash = await prisma.product.findUnique({ where: { slug } });
      if (clash) return bad("A product with that slug already exists.", 409);
    }
    data.slug = slug;
  }
  if (body.note !== undefined) data.note = optionalString(body.note, 300);
  if (body.description !== undefined) data.description = optionalString(body.description, 5000);
  if (body.details !== undefined) data.details = parseDetails(body.details);
  if (body.colors !== undefined) data.colors = parseColors(body.colors);
  if (body.price !== undefined) {
    data.price = body.price === "" || body.price == null ? null : Number(body.price);
  }
  if (body.priceNote !== undefined) data.priceNote = optionalString(body.priceNote, 200);
  if (body.image !== undefined) data.image = optionalString(body.image, 500);
  if (body.order !== undefined && Number.isFinite(Number(body.order))) data.order = Number(body.order);
  if (body.categoryId !== undefined) data.categoryId = optionalString(body.categoryId, 100);
  if (body.seoTitle !== undefined) data.seoTitle = optionalString(body.seoTitle, 200);
  if (body.seoDescription !== undefined) data.seoDescription = optionalString(body.seoDescription, 500);
  if (body.keywords !== undefined) data.keywords = optionalString(body.keywords, 300);
  if (body.status !== undefined) {
    const status = cleanPublish(body.status, current.status);
    data.status = status;
    if (status === "PUBLISHED" && !current.publishedAt) data.publishedAt = new Date();
  }

  const product = await prisma.product.update({ where: { id: current.id }, data });
  revalidateContent("/suits", `/suits/${current.slug}`, `/suits/${product.slug}`);
  return ok({ product });
}

export async function DELETE(request, { params }) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;
  const product = await resolve(params);
  if (!product) return bad("Product not found.", 404);
  await prisma.product.delete({ where: { id: product.id } });
  revalidateContent("/suits", `/suits/${product.slug}`);
  return ok();
}
