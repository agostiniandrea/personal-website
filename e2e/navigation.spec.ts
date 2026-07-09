import { test, expect } from "./fixtures";

test("site header is visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("banner")).toBeVisible();
});

test("clicking a nav anchor updates the URL hash", async ({ page }) => {
  await page.goto("/");
  // Find the first internal anchor in the header that points to a section
  const aboutLink = page
    .getByRole("navigation")
    .getByRole("link", { name: /about/i })
    .first();
  await aboutLink.click();
  await expect(page).toHaveURL(/#about/);
});

test("site footer is present", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("contentinfo")).toBeAttached();
});
