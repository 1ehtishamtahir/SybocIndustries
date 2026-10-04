import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = "admin@firstmoto.example";
const ADMIN_PASS = "Admin123!";
const EDITOR_EMAIL = `editor.e2e.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`;
const EDITOR_PASS = "Editor123!";

let editorId = null;

async function login(page, email, password) {
  await page.goto("/admin/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/admin$/);
}

test.beforeAll(async ({ request }) => {
  const loginRes = await request.post("/api/admin/auth/login", {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASS },
  });
  expect(loginRes.status()).toBe(200);
  const res = await request.post("/api/admin/users", {
    data: { name: "E2E Editor", email: EDITOR_EMAIL, password: EDITOR_PASS, role: "EDITOR" },
  });
  expect(res.status()).toBe(201);
  editorId = (await res.json()).user.id;
});

test.afterAll(async ({ request }) => {
  if (!editorId) return;
  const loginRes = await request.post("/api/admin/auth/login", {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASS },
  });
  if (loginRes.ok()) {
    await request.delete(`/api/admin/users/${editorId}`);
  }
});

test("unauthenticated /admin redirects to the login page", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.locator(".admin-login h1")).toBeVisible();
});

test("login rejects bad credentials without leaking accounts", async ({ page }) => {
  await page.goto("/admin/login");
  await page.fill("#email", ADMIN_EMAIL);
  await page.fill("#password", "definitely-wrong");
  await page.click('button[type="submit"]');
  await expect(page.locator(".form-error")).toContainText("Invalid email or password.");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("admin login lands on the dashboard with full navigation", async ({ page }) => {
  await login(page, ADMIN_EMAIL, ADMIN_PASS);
  await expect(page.locator(".admin-side")).toBeVisible();
  await expect(page.locator(".admin-who")).toContainText("ADMIN");
  await expect(page.locator('.admin-nav a[href="/admin/users"]')).toBeVisible();
  await expect(page.locator('.admin-nav a[href="/admin/settings"]')).toBeVisible();
});

test("page CRUD: create as draft, hidden from public, publish, then delete", async ({ page }) => {
  await login(page, ADMIN_EMAIL, ADMIN_PASS);

  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const title = `E2E Test Page ${suffix}`;
  const slug = `e2e-test-page-${suffix}`;

  await page.goto("/admin/pages/new");
  await page.waitForLoadState("networkidle");
  await page.fill("#page-title", title);
  await page.locator("#page-title").blur();
  await expect(page.locator("#page-slug")).toHaveValue(slug);
  await page.fill("#page-excerpt", "Created by the test suite.");
  await page.locator(".rte").fill("<p>Unique marker content 12345.</p>");
  await page.click('button[type="submit"]');
  await expect(page.locator(".form-error")).toHaveCount(0);
  await expect(page).toHaveURL(/\/admin\/pages$/);
  await expect(page.locator("table a", { hasText: title })).toBeVisible();

  // Draft: public URL must 404.
  const draft = await page.goto(`/${slug}`);
  expect(draft.status()).toBe(404);

  // Publish via API.
  const list = await (await page.request.get("/api/admin/pages")).json();
  const created = list.pages.find((p) => p.slug === slug);
  expect(created).toBeTruthy();
  const patch = await page.request.patch(`/api/admin/pages/${created.id}`, {
    data: { status: "PUBLISHED" },
  });
  expect(patch.status()).toBe(200);

  const live = await page.goto(`/${slug}`);
  expect(live.status()).toBe(200);
  await expect(page.locator("main")).toContainText("Unique marker content 12345.");

  const del = await page.request.delete(`/api/admin/pages/${created.id}`);
  expect(del.status()).toBe(200);
  const gone = await page.goto(`/${slug}`);
  expect(gone.status()).toBe(404);
});

test("product edit saves and the public page reflects the change", async ({ page }) => {
  await login(page, ADMIN_EMAIL, ADMIN_PASS);

  const list = await (await page.request.get("/api/admin/products")).json();
  const product = list.products.find((p) => p.slug !== "apex-one-piece");
  expect(product).toBeTruthy();

  await page.goto(`/admin/products/${product.id}`);
  await page.waitForLoadState("networkidle");
  const marker = `E2E note ${Date.now()}`;
  await page.fill("#p-desc", marker);
  await page.click('button[type="submit"]');
  await expect(page.locator(".form-error")).toHaveCount(0);
  await expect(page).toHaveURL(/\/admin\/products$/);

  const after = await (await page.request.get("/api/admin/products")).json();
  const saved = after.products.find((p) => p.slug === product.slug);
  expect(saved.description).toBe(marker);

  await page.goto(`/suits/${product.slug}`);
  await expect(page.locator("main.product")).toContainText(marker);

  // Restore original description so the suite stays idempotent.
  await page.request.patch(`/api/admin/products/${product.id}`, {
    data: { description: product.description },
  });
});

test("quote submissions appear in the admin inbox", async ({ page }) => {
  await page.goto("/");
  const future = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
  await page.fill("#name", "Inbox Test");
  await page.fill("#company", "Inbox Motors");
  await page.fill("#email", `inbox.${Date.now()}@example.com`);
  await page.fill("#date", future);
  await page.click('button[type="submit"]');
  await expect(page.locator(".form-ok")).toBeVisible();

  await login(page, ADMIN_EMAIL, ADMIN_PASS);
  await page.goto("/admin/submissions");
  await expect(page.locator("table")).toContainText("Inbox Test");
});

test("editor can access content but not users or settings", async ({ page }) => {
  await login(page, EDITOR_EMAIL, EDITOR_PASS);

  await expect(page.locator(".admin-who")).toContainText("EDITOR");
  await expect(page.locator('.admin-nav a[href="/admin/users"]')).toHaveCount(0);
  await expect(page.locator('.admin-nav a[href="/admin/settings"]')).toHaveCount(0);

  // Admin-only API returns 403 for editors.
  const usersRes = await page.request.get("/api/admin/users");
  expect(usersRes.status()).toBe(403);
  const settingsRes = await page.request.get("/api/admin/settings");
  expect(settingsRes.status()).toBe(403);
  const postsRes = await page.request.get("/api/admin/posts");
  expect(postsRes.status()).toBe(200);

  // Admin-only page redirects editors back to the dashboard.
  await page.goto("/admin/users");
  await expect(page).toHaveURL(/\/admin$/);
});

test("sign out ends the session", async ({ page }) => {
  await login(page, ADMIN_EMAIL, ADMIN_PASS);
  await page.click(".admin-side-foot button");
  await expect(page).toHaveURL(/\/admin\/login/);
  const res = await page.request.get("/api/admin/users");
  expect(res.status()).toBe(401);
});
