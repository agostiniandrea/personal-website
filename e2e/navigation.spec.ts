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

  test("tab navigation uses the canonical Work hash", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Work" }).click();
    await expect(page).toHaveURL(/\/#work$/);
    await expect(page.locator("html")).toHaveAttribute("data-mobile-view", "work");
  });

  test("internal CTAs canonicalise legacy section hashes", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "View Projects" }).click();
    await expect(page).toHaveURL(/\/#work$/);
    await expect(page.locator("html")).toHaveAttribute("data-mobile-view", "work");
  });

  test("More destinations stay owned by the More tab", async ({ page }) => {
    await page.goto("/");
    const more = page.getByRole("button", { name: "More" });
    await more.click();
    await expect(page).toHaveURL(/\/#more$/);
    await page
      .getByRole("dialog", { name: "Explore" })
      .getByRole("button", { name: /Skills & tools Technologies and practices/i })
      .click();
    await expect(page).toHaveURL(/\/#skills$/);
    await expect(page.locator("html")).toHaveAttribute("data-mobile-view", "skills");
    await expect(more).toHaveAttribute("aria-current", "page");
  });

  test("Home removes hashes while preserving locale paths and queries", async ({ page }) => {
    await page.goto("/it?preview=1#forest");
    await page.getByRole("button", { name: "Home" }).click();
    await expect(page).toHaveURL(/\/it\?preview=1$/);
    await expect(page.locator("html")).toHaveAttribute("data-mobile-view", "home");
  });

  test("About maps to Home and unknown hashes fall back safely", async ({ page }) => {
    await page.goto("/#about");
    await expect(page.getByRole("button", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await page.goto("/?preview=1#not-a-section");
    await expect(page).toHaveURL(/\/\?preview=1$/);
    await expect(page.locator("html")).toHaveAttribute("data-mobile-view", "home");
  });

  test("browser Back closes More and restores the previous destination", async ({ page }) => {
    await page.goto("/#work");
    await page.getByRole("button", { name: "More" }).click();
    await expect(page).toHaveURL(/\/#more$/);

    await page.goBack();

    await expect(page.getByRole("dialog", { name: "Explore" })).toHaveCount(0);
    await expect(page).toHaveURL(/\/#work$/);
    await expect(page.getByRole("button", { name: "Work" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("a direct More hash opens the sheet", async ({ page }) => {
    await page.goto("/#more");
    await expect(page.getByRole("dialog", { name: "Explore" })).toBeVisible();
    await expect(page.getByRole("button", { name: "More" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("scroll synchronisation uses About and canonical Home URLs", async ({ page }) => {
    await page.goto("/");
    await page.locator("#about").scrollIntoViewIfNeeded();
    await expect(page).toHaveURL(/\/#about$/);
    await expect(page.getByRole("button", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page).toHaveURL(/\/$/);
  });
});
