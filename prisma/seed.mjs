import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client.ts";
import { createAdapter } from "../lib/adapter.js";
import { suits } from "../data/suits.js";
import { heroSlides } from "../data/heroSlides.js";
import { studio } from "../data/content.js";

const prisma = new PrismaClient({ adapter: createAdapter() });

const ADMIN_EMAIL = "admin@firstmoto.example";
const ADMIN_PASSWORD = "Admin123!";

async function upsertNav(menu, order, label, href, isCta = false) {
  const existing = await prisma.navigationItem.findFirst({ where: { menu, href } });
  if (existing) {
    await prisma.navigationItem.update({
      where: { id: existing.id },
      data: { label, order, isCta, visible: true },
    });
  } else {
    await prisma.navigationItem.create({ data: { menu, label, href, order, isCta, visible: true } });
  }
}

async function upsertSetting(s) {
  const existing = await prisma.setting.findUnique({ where: { key: s.key } });
  if (existing) return;
  await prisma.setting.create({ data: s });
}

async function main() {
  const admin = await prisma.adminUser.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) {
    await prisma.adminUser.create({
      data: {
        email: ADMIN_EMAIL,
        name: "Site Administrator",
        role: "ADMIN",
        passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
      },
    });
    console.log(`Created admin user ${ADMIN_EMAIL}`);
  }

  const category = await prisma.category.upsert({
    where: { slug: "suits" },
    update: {},
    create: { name: "Suits", slug: "suits", type: "PRODUCT", description: "Race and road suits" },
  });

  for (const [i, s] of suits.entries()) {
    const data = {
      name: s.name,
      note: s.note,
      description: s.description,
      details: s.details,
      colors: { bg: s.bg, fg: s.fg, base: s.base, accent: s.accent, trim: s.trim },
      status: "PUBLISHED",
      order: i,
      publishedAt: new Date(),
      categoryId: category.id,
    };
    await prisma.product.upsert({ where: { slug: s.slug }, update: data, create: { slug: s.slug, ...data } });
  }
  console.log(`Seeded ${suits.length} products`);

  const settings = [
    { key: "site.name", value: "First Moto", group: "general", label: "Site name", description: "Used in the footer, JSON-LD and admin." },
    { key: "seo.title", value: "First Moto | Wholesale racing and moto suits", group: "seo", label: "Default meta title" },
    { key: "seo.description", value: "Race-grade leather and textile suits for dealers, race teams, schools and fleet buyers.", group: "seo", label: "Default meta description" },
    { key: "seo.titleTemplate", value: "%s | First Moto", group: "seo", label: "Title template", description: "%s is replaced by the page title." },
    { key: "contact.email", value: studio.email, group: "contact", label: "Trade desk email", description: "Shown on the contact page, nav note and footer." },
    { key: "contact.whatsapp", value: "", group: "contact", label: "WhatsApp number", description: "Digits only, e.g. 27821234567. Leave empty to hide WhatsApp links." },
    { key: "contact.hours", value: JSON.stringify(studio.hours), group: "contact", label: "Trade desk hours", description: "One line per entry." },
    { key: "contact.notes", value: JSON.stringify(studio.notes), group: "contact", label: "Quote page notes" },
    { key: "footer.brandText", value: "Race-grade leather and textile suits for dealers, race teams and fleets.", group: "footer", label: "Footer brand text" },
    { key: "footer.tagline", value: "Ride first. Ride strong.", group: "footer", label: "Footer tagline", description: "Line after the copyright." },
    { key: "home.heroSlides", value: JSON.stringify(heroSlides, null, 2), group: "home", label: "Home hero slides", description: "JSON array of { src, alt, title, note }." },
  ];
  for (const s of settings) await upsertSetting(s);
  console.log(`Seeded ${settings.length} settings`);

  const header = [
    ["Suits", "/suits", false],
    ["Why First Moto", "/why", false],
    ["FAQ", "/faq", false],
    ["Contact", "/contact", false],
    ["Request a quote", "/quote", true],
  ];
  for (const [i, [label, href, isCta]] of header.entries()) {
    await upsertNav("HEADER", i + 1, label, href, isCta);
  }
  const footer = [
    ["Suits", "/suits"],
    ["Why First Moto", "/why"],
    ["Request a quote", "/quote"],
    ["FAQ", "/faq"],
    ["Contact", "/contact"],
    ["Blog", "/blog"],
    ["Privacy", "/privacy"],
  ];
  for (const [i, [label, href]] of footer.entries()) {
    await upsertNav("FOOTER", i + 1, label, href, href === "/quote");
  }
  console.log(`Seeded ${header.length + footer.length} navigation items`);

  const newsCategory = await prisma.category.upsert({
    where: { slug: "news" },
    update: {},
    create: { name: "News", slug: "news", type: "BLOG" },
  });
  const tag = await prisma.tag.upsert({
    where: { slug: "announcements" },
    update: {},
    create: { name: "Announcements", slug: "announcements" },
  });
  const postSlug = "welcome";
  const postContent = [
    "<p>First Moto builds race-grade leather and textile suits for dealers, race teams, schools and fleet buyers.</p>",
    "<p>This journal covers production updates, sizing and fitting guidance, certification notes and the track days we attend. For pricing, model mixes and lead times, the trade desk answers within one working day.</p>",
  ].join("");
  const postData = {
    title: "First Moto goes wholesale direct",
    excerpt: "Race-grade suits, quoted per order, answered within a working day.",
    content: postContent,
    status: "PUBLISHED",
    publishedAt: new Date(),
    categoryId: newsCategory.id,
  };
  const post = await prisma.blogPost.upsert({
    where: { slug: postSlug },
    update: {},
    create: { slug: postSlug, ...postData, tags: { connect: { id: tag.id } } },
  });
  console.log(`Seeded blog post ${post.slug}`);

  const mediaFiles = [
    { file: "logo.png", alt: "First Moto logo" },
    { file: "og.jpg", alt: "First Moto social share image" },
  ];
  let mediaCount = 0;
  for (const m of mediaFiles) {
    const abs = path.join(process.cwd(), "public", m.file);
    if (!fs.existsSync(abs)) continue;
    const existing = await prisma.media.findFirst({ where: { path: `/${m.file}` } });
    if (existing) continue;
    const stat = fs.statSync(abs);
    await prisma.media.create({
      data: {
        filename: m.file,
        originalName: m.file,
        mimeType: m.file.endsWith(".png") ? "image/png" : "image/jpeg",
        size: stat.size,
        path: `/${m.file}`,
        alt: m.alt,
      },
    });
    mediaCount += 1;
  }
  console.log(`Seeded ${mediaCount} media items`);

  const counts = {
    adminUsers: await prisma.adminUser.count(),
    products: await prisma.product.count(),
    settings: await prisma.setting.count(),
    navigationItems: await prisma.navigationItem.count(),
    posts: await prisma.blogPost.count(),
    media: await prisma.media.count(),
  };
  console.log("Seed complete:", JSON.stringify(counts));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
