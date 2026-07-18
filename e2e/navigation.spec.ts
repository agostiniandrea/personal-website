import { expect,test } from "./fixtures";

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

test.describe("mobile app navigation accessibility", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("closed More sheet is hidden and opening moves focus into it", async ({ page }) => {
    await page.goto("/");
    const more = page.getByRole("button", { name: "More" });

    await expect(page.getByRole("dialog", { name: "Explore" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Close menu" })).toHaveCount(0);

    await more.click();

    const dialog = page.getByRole("dialog", { name: "Explore" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Close menu" })).toBeFocused();
    await expect(more).toHaveAttribute("aria-current", "page");
  });

  test("Escape closes More and restores focus to its tab", async ({ page }) => {
    await page.goto("/");
    const more = page.getByRole("button", { name: "More" });
    await more.click();

    await page.keyboard.press("Escape");

    await expect(page.getByRole("dialog", { name: "Explore" })).toHaveCount(0);
    await expect(more).toBeFocused();
  });

  test("focus wraps within the open More sheet", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "More" }).click();
    const dialog = page.getByRole("dialog", { name: "Explore" });
    const localeButton = dialog.getByRole("button", { name: "IT", exact: true });

    await expect(dialog.getByRole("button", { name: "Close menu" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");

    await expect(localeButton).toBeFocused();
  });

  test("tab navigation keeps the public URL clean", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Work" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("html")).toHaveAttribute("data-mobile-view", "work");
  });

  test("internal CTAs switch views without exposing section hashes", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "View Projects" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("html")).toHaveAttribute("data-mobile-view", "work");
  });

  test("More destinations stay owned by the More tab", async ({ page }) => {
    await page.goto("/");
    const more = page.getByRole("button", { name: "More" });
    await more.click();
    await page
      .getByRole("dialog", { name: "Explore" })
      .getByRole("button", { name: /Skills & tools Technologies and practices/i })
      .click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("html")).toHaveAttribute("data-mobile-view", "skills");
    await expect(more).toHaveAttribute("aria-current", "page");
  });
});
