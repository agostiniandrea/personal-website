import { test as base } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    // Pre-accept cookies so the banner never blocks test interactions
    await page.addInitScript(() => {
      localStorage.setItem("cookie-consent", "accepted");
    });
    await use(page);
  },
});

export { expect } from "@playwright/test";
