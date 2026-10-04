import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = [
  ["/", "home"],
  ["/suits", "suits"],
  ["/suits/apex-one-piece", "product"],
  ["/quote", "quote"],
  ["/faq", "faq"],
  ["/contact", "contact"],
  ["/why", "why"],
  ["/privacy", "privacy"],
  ["/does-not-exist", "404"],
];

for (const [path, name] of pages) {
  test(`a11y: ${name} (${path}) has no serious violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(
      bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
    ).toEqual([]);
  });
}
