import { test, expect } from "@playwright/test";

const shots = [
  ["home", "/"],
  ["suits", "/suits"],
  ["product", "/suits/apex-one-piece"],
  ["quote", "/quote"],
  ["404", "/does-not-exist"],
];

for (const [name, path] of shots) {
  test(`visual: ${name}`, async ({ page }) => {
    // Disable GSAP-driven motion so screenshots capture the deterministic resting state.
    await page.addInitScript(() => {
      window.__NO_GSAP__ = true;
    });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    await expect(page).toHaveScreenshot(`${name}.png`, {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    });
  });
}

// Guards the mobile hero fix (.stripe{right:-30%} keeps red "Moto" off the stripe).
test("visual: home (mobile)", async ({ page }) => {
  await page.addInitScript(() => {
    window.__NO_GSAP__ = true;
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await expect(page).toHaveScreenshot("home-mobile.png", {
    maxDiffPixelRatio: 0.02,
    animations: "disabled",
  });
});
