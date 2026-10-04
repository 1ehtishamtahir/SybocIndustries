import { test, expect } from "@playwright/test";

test("home page renders with expected title and hero", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/First Moto/);
  await expect(page.locator("h1")).toContainText("First");
  await expect(page.locator("h1")).toContainText("Moto");
});

test("html has scroll padding so anchors clear the fixed nav", async ({ page }) => {
  await page.goto("/");
  const padding = await page.evaluate(() => getComputedStyle(document.documentElement).scrollPaddingTop);
  expect(padding).not.toBe("0px");
});

test("suit cards link to product pages", async ({ page }) => {
  await page.goto("/");
  const first = page.locator(".card h3 a").first();
  await expect(first).toHaveAttribute("href", /^\/suits\//);
  await first.click();
  await expect(page).toHaveURL(/\/suits\/[a-z-]+$/);
  await expect(page.locator("main.product h1")).toBeVisible();
  await expect(page.locator(".product-price")).toContainText("on request");
});

test("product page exposes Product JSON-LD", async ({ page }) => {
  await page.goto("/suits/apex-one-piece");
  const data = await page.locator('script[type="application/ld+json"]').first().textContent();
  const parsed = JSON.parse(data);
  expect(parsed["@type"]).toBe("Product");
  expect(parsed.sku).toBe("apex-one-piece");
  expect(parsed.offers).toBeUndefined();
});

test("FAQ page exposes FAQPage JSON-LD", async ({ page }) => {
  await page.goto("/faq");
  const data = await page.locator('script[type="application/ld+json"]').first().textContent();
  const parsed = JSON.parse(data);
  expect(parsed["@type"]).toBe("FAQPage");
  expect(parsed.mainEntity.length).toBeGreaterThan(0);
});

test("quote form validates then submits", async ({ page }) => {
  await page.goto("/");
  const future = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
  await page.fill("#name", "Test Buyer");
  await page.fill("#company", "Test Motors");
  await page.fill("#email", "buyer@example.com");
  await page.fill("#date", future);
  await page.click('button[type="submit"]');
  await expect(page.locator(".form-ok")).toContainText("Quote request received");
});

test("quote form rejects a bad email", async ({ page }) => {
  await page.goto("/");
  await page.fill("#name", "Test Buyer");
  await page.fill("#company", "Test Motors");
  await page.fill("#email", "not-an-email");
  await page.click('button[type="submit"]');
  await expect(page.locator(".form-error")).toContainText("valid email");
});

test("mobile menu opens and closes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const btn = page.locator(".menu-btn");
  await expect(btn).toBeVisible();
  await expect(page.locator("#nav-links a").first()).not.toBeInViewport();
  await btn.click();
  await expect(page.locator("#nav-links a").first()).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(page.locator("#nav-links a").first()).not.toBeInViewport();
});

test("sitemap and robots are served", async ({ page, request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const xml = await sitemap.text();
  expect(xml).toContain("/suits/apex-one-piece");
  expect(xml).toContain("/privacy");
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain("Sitemap:");
});

const routes = [
  ["/", /First/],
  ["/suits", /The 2026 line/],
  ["/why", /Made to be crashed in/],
  ["/quote", /trade quote/],
  ["/faq", /Questions/],
  ["/contact", /Talk to the trade desk/],
  ["/privacy", /Privacy/],
  ["/suits/apex-one-piece", /Apex One-Piece/],
];

for (const [path, heading] of routes) {
  test(`page renders: ${path}`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res.status()).toBe(200);
    await expect(page.locator("h1")).toContainText(heading);
    await expect(page.locator("footer .footer-nav a").first()).toBeVisible();
  });
}

test("nav links point at the real pages", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('#nav-links a[href="/suits"]')).toHaveCount(1);
  await expect(page.locator('#nav-links a[href="/why"]')).toHaveCount(1);
  await expect(page.locator('#nav-links a[href="/quote"]')).toHaveCount(1);
});

test("current page is marked in the nav", async ({ page }) => {
  await page.goto("/why");
  await expect(page.locator('#nav-links a[href="/why"]')).toHaveAttribute("aria-current", "page");
  await expect(page.locator('#nav-links a[href="/suits"]')).not.toHaveAttribute("aria-current", "page");
  const bg = await page.locator('#nav-links a[href="/why"]').evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).toBe("rgb(225, 6, 0)");
});

test("nav carries FAQ and Contact links", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('#nav-links a[href="/faq"]')).toHaveCount(1);
  await expect(page.locator('#nav-links a[href="/contact"]')).toHaveCount(1);
});

test("suits dropdown reveals the five suits", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const drop = page.locator("#nav-links .dropdown");
  await expect(drop).not.toBeVisible();
  await page.locator("#nav-links > .nav-item > a").hover();
  await expect(drop).toBeVisible();
  await expect(drop.locator("a")).toHaveCount(5);
  await drop.locator('a[href="/suits/apex-one-piece"]').click();
  await expect(page).toHaveURL(/\/suits\/apex-one-piece/);
});

test("nav hides on scroll down and returns on scroll up", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(400);
  const nav = page.locator(".nav");
  await expect(nav).not.toHaveClass(/is-hidden/);
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: "instant" }));
  await page.waitForTimeout(350);
  await expect(nav).toHaveClass(/is-hidden/);
  await expect(nav).toHaveClass(/is-compact/);
  await page.evaluate(() => window.scrollTo({ top: 400, behavior: "instant" }));
  await page.waitForTimeout(350);
  await expect(nav).not.toHaveClass(/is-hidden/);
  await expect(nav).toHaveClass(/is-compact/);
});

test("unknown route shows the branded 404", async ({ page }) => {
  const res = await page.goto("/does-not-exist");
  expect(res.status()).toBe(404);
  await expect(page.locator("h1")).toContainText("Wrong turn");
});

test("old fitting route redirects to the quote page", async ({ page }) => {
  await page.goto("/fitting");
  await expect(page).toHaveURL(/\/quote$/);
  await expect(page.locator("h1")).toContainText("trade quote");
});

test("product page leads to a prefilled quote request", async ({ page }) => {
  await page.goto("/suits/apex-one-piece");
  await page.getByRole("link", { name: "Request a quote for this suit" }).click();
  await expect(page).toHaveURL(/\/quote\?suit=apex-one-piece/);
  await expect(page.locator("#notes")).toHaveValue("Interested in Apex One-Piece");
  await expect(page.locator('select[name="suit"]')).toHaveValue("apex-one-piece");
  await page.fill("#name", "Test Buyer");
  await page.fill("#company", "Test Motors");
  await page.fill("#email", "buyer@example.com");
  await page.click('button[type="submit"]');
  await expect(page.locator(".form-ok")).toContainText("Quote request received");
});

test("API rejects unknown suits and ignores honeypot bots", async ({ request }) => {
  const bad = await request.post("/api/quote", {
    data: { name: "X", email: "x@example.com", company: "Acme", suit: "not-a-suit" },
  });
  expect(bad.status()).toBe(400);
  const bot = await request.post("/api/quote", {
    data: { name: "Bot", email: "bot@example.com", company: "Spam Co", website: "spam.example" },
  });
  expect(bot.ok()).toBeTruthy();
});

test("security headers are sent", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["x-frame-options"]).toBe("DENY");
  expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  expect(res.headers()["content-security-policy"]).toContain("default-src 'self'");
});
