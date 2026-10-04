import { getPublishedProducts, getPublishedPosts, getAllPublishedPageSlugs } from "../lib/content";

export const dynamic = "force-dynamic";

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://firstmoto.example";

const pages = ["/suits", "/why", "/quote", "/faq", "/contact", "/privacy", "/blog"];

export default async function sitemap() {
  const [products, posts, cmsPages] = await Promise.all([
    getPublishedProducts(),
    getPublishedPosts(),
    getAllPublishedPageSlugs(),
  ]);

  return [
    { url: `${site}/`, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    ...pages.map((p) => ({
      url: `${site}${p}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    })),
    ...products.map((p) => ({
      url: `${site}/suits/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    })),
    ...posts.map((p) => ({
      url: `${site}/blog/${p.slug}`,
      lastModified: new Date(p.publishedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    })),
    ...cmsPages.map((slug) => ({
      url: `${site}/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    })),
  ];
}
