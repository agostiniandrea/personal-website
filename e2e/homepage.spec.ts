import { expect,test } from "./fixtures";

test("homepage loads with a visible h1", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("all primary sections exist in the DOM", async ({ page }) => {
  await page.goto("/");
  for (const id of ["#about", "#experience", "#projects", "#forest"]) {
    await expect(page.locator(id)).toBeAttached();
  }
});

test("skip link is present and points to main content", async ({ page }) => {
  await page.goto("/");
  const skip = page.getByRole("link", { name: /skip to main content/i });
  await expect(skip).toBeAttached();
  await expect(skip).toHaveAttribute("href", "#main-content");
});

test("page title is not empty", async ({ page }) => {
  await page.goto("/");
  const title = await page.title();
  expect(title.length).toBeGreaterThan(0);
});
