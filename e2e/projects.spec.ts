import { expect,test } from "./fixtures";

test("at least one project card is visible", async ({ page }) => {
  await page.goto("/");
  await page.locator("#projects").scrollIntoViewIfNeeded();
  // Cards are rendered as article elements or links inside the projects section
  const cards = page.locator("#projects article");
  await expect(cards.first()).toBeVisible();
});

test("CV download link exists and has an href", async ({ page }) => {
  await page.goto("/");
  const cvLink = page.getByRole("link", { name: /cv/i }).first();
  await expect(cvLink).toBeVisible();
  const href = await cvLink.getAttribute("href");
  expect(href).toBeTruthy();
});
