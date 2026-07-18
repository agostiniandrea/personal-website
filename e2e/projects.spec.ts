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

test.describe("mobile hero CV tertiary CTA", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const [path, label] of [["/", "Download CV"], ["/it", "Scarica CV"]]) {
    test(`${label} underline fits its centred content`, async ({ page }) => {
      await page.goto(path);
      const link = page.getByRole("link", { name: label, exact: true });
      await expect(link).toBeVisible();
      const measurements = await link.evaluate((element) => {
        const styles = getComputedStyle(element);
        const parentWidth = element.parentElement?.getBoundingClientRect().width ?? 0;
        const rect = element.getBoundingClientRect();
        return {
          borderBottomWidth: styles.borderBottomWidth,
          height: rect.height,
          parentWidth,
          width: rect.width,
        };
      });
      expect(measurements.borderBottomWidth).toBe("1px");
      expect(measurements.height).toBeGreaterThanOrEqual(44);
      expect(measurements.width).toBeLessThan(measurements.parentWidth);
      await expect(link.locator('[aria-hidden="true"]')).toHaveText("↓");
    });
  }
});
