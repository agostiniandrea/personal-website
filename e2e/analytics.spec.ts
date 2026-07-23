import { expect, test } from "./fixtures";

test("localhost does not load GA4 or Clarity after analytics consent", async ({
  page,
}) => {
  const analyticsRequests: string[] = [];

  page.on("request", (request) => {
    if (
      /googletagmanager\.com|google-analytics\.com|clarity\.ms/.test(
        request.url(),
      )
    ) {
      analyticsRequests.push(request.url());
    }
  });

  await page.addInitScript(() => {
    localStorage.setItem("cookie-consent", "accepted");
  });
  await page.goto("/");
  await expect(page.getByRole("main")).toBeVisible();

  await expect(page.locator('script[src*="googletagmanager.com"]')).toHaveCount(
    0,
  );
  await expect(page.locator("#ga-init")).toHaveCount(0);
  await expect(page.locator("#clarity-init")).toHaveCount(0);
  expect(analyticsRequests).toHaveLength(0);
});
