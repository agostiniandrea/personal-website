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
  // LocaleButton is a <button> with aria-label "Switch to Italian" on the EN page
  await page.getByRole("button", { name: /switch to italian/i }).first().click();
  await expect(page).toHaveURL(/\/it/);
});

test("language switcher navigates back to English from Italian", async ({
  page,
}) => {
  await page.goto("/it");
  await page.getByRole("button", { name: /passa a inglese/i }).first().click();
  await expect(page).toHaveURL(/^http:\/\/localhost:3000\/$/);
});
