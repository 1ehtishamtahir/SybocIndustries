import { getPublishedProducts, getPublishedPosts, getAllPublishedPageSlugs } from "../lib/content";

export const dynamic = "force-static";

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://sybocindustries.example";

// The static export serves directory URLs (/blog/); the server build serves
// the extensionless paths the app links to (/blog).
const suffix = process.env.NEXT_OUTPUT === "export" ? "/" : "";

const pages = ["/products", "/why", "/company-profile", "/blog", "/privacy", "/terms", "/quote", "/faq", "/contact"];

export default async function sitemap() {
  const [products, posts, cmsPages] = await Promise.all([
    getPublishedProducts(),
    getPublishedPosts(),
    getAllPublishedPageSlugs(),
  ]);

  return [
    { url: `${site}/`, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    ...pages.map((p) => ({
      url: `${site}${p}${suffix}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    })),
    ...products.map((p) => ({
      url: `${site}/suits/${p.slug}${suffix}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    })),
    ...posts.map((p) => ({
      url: `${site}/blog/${p.slug}${suffix}`,
      lastModified: new Date(p.publishedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    })),
    ...cmsPages.map((slug) => ({
      url: `${site}/${slug}${suffix}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    })),
  ];
}
