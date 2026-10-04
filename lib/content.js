import { cache } from "react";
import { prisma } from "./db.js";

export function parseJson(value, fallback) {
  if (value == null || value === "") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export const getSettings = cache(async () => {
  const rows = await prisma.setting.findMany({ orderBy: { key: "asc" } });
  return Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
});

export async function getSetting(key, fallback = "") {
  const settings = await getSettings();
  return settings[key] ?? fallback;
}

export const getNavigation = cache(async (menu) => {
  const rows = await prisma.navigationItem.findMany({
    where: { menu, visible: true },
    orderBy: { order: "asc" },
  });
  return rows.map((r) => ({ label: r.label, href: r.href, isCta: r.isCta }));
});

// Maps a Product row to the same shape data/suits.js used, so existing
// markup keeps working: colors are flattened, JSON fields unwrapped.
export function toProductView(p) {
  const colors = p.colors && typeof p.colors === "object" ? p.colors : {};
  return {
    slug: p.slug,
    name: p.name,
    note: p.note ?? "",
    description: p.description ?? "",
    details: Array.isArray(p.details) ? p.details : [],
    bg: colors.bg ?? "#000",
    fg: colors.fg ?? "#fff",
    base: colors.base ?? "#000",
    accent: colors.accent ?? "#e10600",
    trim: colors.trim ?? "#000",
    price: p.price != null ? Number(p.price.toString()) : null,
    priceNote: p.priceNote ?? null,
    image: p.image ?? null,
    seoTitle: p.seoTitle ?? null,
    seoDescription: p.seoDescription ?? null,
    keywords: p.keywords ?? null,
    order: p.order,
  };
}

export const getPublishedProducts = cache(async () => {
  const rows = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { order: "asc" },
  });
  return rows.map(toProductView);
});

export const getPublishedProduct = cache(async (slug) => {
  const row = await prisma.product.findFirst({ where: { slug, status: "PUBLISHED" } });
  return row ? toProductView(row) : null;
});

function toPostView(p) {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt ?? "",
    content: p.content,
    coverImage: p.coverImage ?? null,
    seoTitle: p.seoTitle ?? null,
    seoDescription: p.seoDescription ?? null,
    keywords: p.keywords ?? null,
    publishedAt: p.publishedAt ?? p.createdAt,
    category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
    tags: (p.tags ?? []).map((t) => ({ name: t.name, slug: t.slug })),
    author: p.author ? { name: p.author.name } : null,
  };
}

export const getPublishedPosts = cache(async () => {
  const rows = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { category: true, tags: true, author: true },
  });
  return rows.map(toPostView);
});

export const getPublishedPost = cache(async (slug) => {
  const row = await prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { category: true, tags: true, author: true },
  });
  return row ? toPostView(row) : null;
});

function toPageView(p) {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt ?? "",
    content: p.content,
    seoTitle: p.seoTitle ?? null,
    seoDescription: p.seoDescription ?? null,
    keywords: p.keywords ?? null,
  };
}

export const getPublishedPage = cache(async (slug) => {
  const row = await prisma.page.findFirst({ where: { slug, status: "PUBLISHED" } });
  return row ? toPageView(row) : null;
});

export const getAllPublishedPageSlugs = cache(async () => {
  const rows = await prisma.page.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
  return rows.map((r) => r.slug);
});
