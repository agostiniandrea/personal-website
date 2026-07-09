import { test, expect } from "./fixtures";

test("Italian page loads and sets lang attribute", async ({ page }) => {
  await page.goto("/it");
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
});

test("English page sets lang attribute", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("language switcher navigates to Italian version", async ({ page }) => {
  await page.goto("/");
  // The lang switcher renders two links: EN (active) and IT
  const itLink = page.getByRole("link", { name: /^IT$/i });
  await itLink.first().click();
  await expect(page).toHaveURL(/\/it/);
});

test("language switcher navigates back to English from Italian", async ({
  page,
}) => {
  await page.goto("/it");
  const enLink = page.getByRole("link", { name: /^EN$/i });
  await enLink.first().click();
  await expect(page).toHaveURL(/^http:\/\/localhost:3000\/$/);
});
