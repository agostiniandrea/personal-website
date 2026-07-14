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

test.describe("mobile navigation accessibility", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("closed menu is hidden and opening moves focus into the dialog", async ({ page }) => {
    await page.goto("/");
    const hamburger = page.getByRole("button", { name: "Open menu" });

    await expect(page.getByRole("dialog", { name: "Navigation menu" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Close menu" })).toHaveCount(0);

    await hamburger.click();

    const dialog = page.getByRole("dialog", { name: "Navigation menu" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Close menu" })).toBeFocused();
  });

  test("Escape closes the menu and restores focus to the hamburger", async ({ page }) => {
    await page.goto("/");
    const hamburger = page.getByRole("button", { name: "Open menu" });
    await hamburger.click();

    await page.keyboard.press("Escape");

    await expect(page.getByRole("dialog", { name: "Navigation menu" })).toHaveCount(0);
    await expect(hamburger).toBeFocused();
  });

  test("focus wraps within the open menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Navigation menu" });
    const localeButton = dialog.getByRole("button", { name: "Switch to Italian" });

    await expect(dialog.getByRole("button", { name: "Close menu" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");

    await expect(localeButton).toBeFocused();
  });
});
