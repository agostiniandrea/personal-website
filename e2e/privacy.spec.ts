import { expect, test } from "@playwright/test";

/* These use Playwright's own `test`, not the shared fixture: the fixture
   pre-accepts cookies on every navigation, which would hide the banner this
   page is about. */

test("privacy policy is available in English and Italian", async ({ page }) => {
  await page.goto("/privacy");
  await expect(
    page.getByRole("heading", { level: 1, name: "Privacy policy" }),
  ).toBeVisible();
  await expect(page.getByText("Microsoft Clarity").first()).toBeVisible();

  await page.goto("/it/privacy");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Informativa sulla privacy",
    }),
  ).toBeVisible();
});

test("the cookie choice can be changed from the privacy page", async ({
  page,
}) => {
  await page.goto("/privacy");

  const banner = page.getByRole("dialog", { name: "This site uses cookies" });
  await expect(banner).toBeVisible();
  await banner.getByRole("button", { name: "Reject non-essential" }).click();
  await expect(banner).toBeHidden();

  await page.reload();
  await expect(banner).toBeHidden();

  await page.getByRole("button", { name: "Change my cookie choice" }).click();
  await expect(banner).toBeVisible();
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the tab bar is there and leads back into the app", async ({ page }) => {
    await page.goto("/privacy");

    const nav = page.getByTestId("mobile-nav");
    await expect(nav).toBeVisible();

    await page
      .getByRole("dialog", { name: "This site uses cookies" })
      .getByRole("button", { name: "Reject non-essential" })
      .click();

    await nav.getByRole("button", { name: "Work" }).click();
    await expect(page).toHaveURL(/\/#work$/);
    await expect(page.locator("#projects")).toBeVisible();
  });
});
