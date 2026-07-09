import { test, expect } from "./fixtures";

test("site header is visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("banner")).toBeVisible();
});

test("desktop nav contains the expected section links", async ({ page }) => {
  await page.goto("/");
  const desktopNav = page.locator('nav[aria-label="Main navigation"]');
  await expect(desktopNav).toBeVisible();
  // Verify the nav links that Contentful configures are present
  for (const href of ["/#skills", "/#journey", "/#experience", "/#forest"]) {
    await expect(desktopNav.locator(`a[href="${href}"]`)).toBeAttached();
  }
});

test("site footer is present", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("contentinfo")).toBeAttached();
});
