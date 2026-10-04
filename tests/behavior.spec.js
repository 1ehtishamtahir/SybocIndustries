import { test, expect } from "@playwright/test";

test.describe("reduced motion", () => {
  test("horizontal suit track falls back to a static stack", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const pos = await page.locator(".hsticky").evaluate((el) => getComputedStyle(el).position);
    expect(pos).toBe("static");
  });

  test("first-visit splash is skipped", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForTimeout(300);
    await expect(page.locator(".splash")).toHaveCount(0);
  });
});

test.describe("progressive enhancement", () => {
  test("page content and suit track work without JS", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    // Streamed content is revealed via <noscript> CSS, loading shell dropped.
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.locator(".state-page")).toBeHidden();
    await expect(page.locator(".hwrap")).not.toHaveAttribute("data-enh", "1");
    const metrics = await page.locator(".hsticky").evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      overflowX: getComputedStyle(el).overflowX,
    }));
    expect(metrics.overflowX).toBe("auto");
    expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);
    await context.close();
  });
});

test.describe("API abuse controls", () => {
  test("rate limits a single client after 10 requests", async ({ request }) => {
    const headers = { "x-forwarded-for": "203.0.113.99" };
    const statuses = [];
    for (let i = 0; i < 11; i++) {
      const res = await request.post("/api/quote", {
        headers,
        // Honeypot field: succeeds without delivering an email.
        data: { name: "X", email: "x@example.com", company: "Rate Co", website: "spam.example" },
      });
      statuses.push(res.status());
    }
    expect(statuses.slice(0, 10)).toEqual(Array(10).fill(200));
    expect(statuses[10]).toBe(429);
  });

  test("rejects past delivery dates", async ({ request }) => {
    const res = await request.post("/api/quote", {
      data: { name: "X", email: "x@example.com", company: "Acme", date: "2000-01-01" },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/future/i);
  });

  test("requires a company name", async ({ request }) => {
    const res = await request.post("/api/quote", {
      data: { name: "X", email: "x@example.com" },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/company/i);
  });
});
