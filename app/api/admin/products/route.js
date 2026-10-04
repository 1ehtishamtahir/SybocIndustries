import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { readJson, bad, ok, slugify, cleanPublish, optionalString, parseDetails, parseColors } from "@/lib/adminApi";
import { revalidateContent } from "@/lib/revalidate";

export async function GET() {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;
  const products = await prisma.product.findMany({
    orderBy: { order: "asc" },
    include: { category: true },
  });
  return ok({ products });
}

export async function POST(request) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;

  const body = await readJson(request);
  if (!body) return bad("Invalid request body.");

  const name = String(body.name ?? "").trim();
  if (!name) return bad("Name is required.");
  const slug = slugify(body.slug || name);
  if (!slug) return bad("A valid slug is required.");

  const clash = await prisma.product.findUnique({ where: { slug } });
  if (clash) return bad("A product with that slug already exists.", 409);

  const status = cleanPublish(body.status);
  const product = await prisma.product.create({
    data: {
      name,
      slug,
      note: optionalString(body.note, 300),
      description: optionalString(body.description, 5000),
      details: parseDetails(body.details),
      colors: parseColors(body.colors),
      price: body.price !== undefined && body.price !== "" && body.price != null ? Number(body.price) : null,
      priceNote: optionalString(body.priceNote, 200),
      image: optionalString(body.image, 500),
      order: Number.isInteger(Number(body.order)) ? Number(body.order) : 0,
      status,
      seoTitle: optionalString(body.seoTitle, 200),
      seoDescription: optionalString(body.seoDescription, 500),
      keywords: optionalString(body.keywords, 300),
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      categoryId: optionalString(body.categoryId, 100),
    },
  });

  revalidateContent("/suits", `/suits/${product.slug}`);
  return ok({ product });
}
