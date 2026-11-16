import { cache } from "react";
import { suits } from "../data/suits.js";
import { heroSlides } from "../data/heroSlides.js";
import { studio } from "../data/content.js";

export function parseJson(value, fallback) {
  if (value == null || value === "") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

const settings = {
  "site.name": "SYBOC INDUSTRIES",
  "seo.title": "SYBOC INDUSTRIES | Leather, Motorcycle and Western Wear",
  "seo.description": "SYBOC INDUSTRIES creates distinctive Leather Wear, Motorcycle Wear and Western Wear for retailers and independent brands.",
  "seo.titleTemplate": "%s | SYBOC INDUSTRIES",
  "contact.email": studio.email,
  "contact.phone": "+92 328 816 6661",
  "contact.whatsapp": studio.whatsapp,
  "social.instagram": "https://www.instagram.com/sybocindustry",
  "social.facebook": "https://www.facebook.com/sybocindustry",
  "social.linkedin": "",
  "social.pinterest": "",
  "social.tiktok": "",
  "contact.hours": JSON.stringify(studio.hours),
  "contact.notes": JSON.stringify(studio.notes),
  "footer.brandText": "Leather Wear, Motorcycle Wear and Western Wear for retailers, teams and independent brands.",
  "footer.tagline": "Wear your identity.",
  "home.heroSlides": JSON.stringify(heroSlides),
};

const navigation = {
  HEADER: [
    { label: "Products", href: "/products", isCta: false },
    { label: "Why Us", href: "/why", isCta: false },
    { label: "Company Profile", href: "/company-profile", isCta: false },
    { label: "Blog", href: "/blog", isCta: false },
    { label: "Request a quote", href: "/quote", isCta: true },
  ],
  FOOTER: [
    { label: "Products", href: "/products", isCta: false },
    { label: "Why Us", href: "/why", isCta: false },
    { label: "Company Profile", href: "/company-profile", isCta: false },
    { label: "Request a quote", href: "/quote", isCta: true },
    { label: "FAQ", href: "/faq", isCta: false },
    { label: "Contact", href: "/contact", isCta: false },
    { label: "Blog", href: "/blog", isCta: false },
    { label: "Privacy Policy", href: "/privacy", isCta: false },
    { label: "Terms and Conditions", href: "/terms", isCta: false },
  ],
};

const products = suits.map((product) => ({ ...product, price: null, priceNote: null }));
const posts = [{
  slug: "the-syboc-collection",
  title: "SYBOC INDUSTRIES opens the collection to wholesale",
  excerpt: "Leather, motorcycle and western wear for retailers and independent brands.",
  content: "<p>SYBOC INDUSTRIES creates distinctive Leather Wear, Motorcycle Wear and Western Wear for retailers and independent brands.</p><p>Contact the trade desk for product mixes, wholesale availability and ordering information.</p>",
  publishedAt: new Date("2026-01-15"),
  category: { name: "Announcements", slug: "announcements" },
  tags: [{ name: "Announcements", slug: "announcements" }],
  author: null,
  seoTitle: null,
  seoDescription: null,
  keywords: null,
}];

export const getSettings = cache(async () => settings);
export async function getSetting(key, fallback = "") { return settings[key] ?? fallback; }
export const getNavigation = cache(async (menu) => navigation[menu] ?? []);

// Maps a Product row to the same shape data/suits.js used, so existing
// markup keeps working: colors are flattened, JSON fields unwrapped.
export function toProductView(p) {
  const colors = p.colors && typeof p.colors === "object" ? p.colors : {};
  return {
    slug: p.slug,
    articleCode: p.articleCode ?? "",
    name: p.name,
    category: p.category?.name ?? p.category ?? null,
    subcategory: p.subcategory ?? null,
    note: p.note ?? "",
    description: p.description ?? "",
    details: Array.isArray(p.details) ? p.details : [],
    bg: colors.bg ?? p.bg ?? "#000",
    fg: colors.fg ?? p.fg ?? "#fff",
    base: colors.base ?? p.base ?? "#000",
    accent: colors.accent ?? p.accent ?? "#e10600",
    trim: colors.trim ?? p.trim ?? "#000",
    price: p.price != null ? Number(p.price.toString()) : null,
    priceNote: p.priceNote ?? null,
    image: p.image ?? null,
    seoTitle: p.seoTitle ?? null,
    seoDescription: p.seoDescription ?? null,
    keywords: p.keywords ?? null,
    order: p.order,
  };
}

export const getPublishedProducts = cache(async () => products);

export const getPublishedProduct = cache(async (slug) => {
  if (!slug) return null;
  const s = String(slug).toLowerCase();
  return (
    products.find(
      (p) =>
        p.slug === s ||
        p.articleCode?.toLowerCase() === s ||
        (p.legacySlug && p.legacySlug.toLowerCase() === s)
    ) ?? null
  );
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

export const getPublishedPosts = cache(async () => posts);

export const getPublishedPost = cache(async (slug) => posts.find((p) => p.slug === slug) ?? null);

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

export const getPublishedPage = cache(async () => null);

export const getAllPublishedPageSlugs = cache(async () => []);
