import { test, expect } from "./fixtures";

async function openModal(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.locator("#forest").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /plant a leaf/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

test("Forest CTA opens the feedback modal", async ({ page }) => {
  await openModal(page);
});

test("modal closes when the X button is clicked", async ({ page }) => {
  await openModal(page);
  await page.getByRole("button", { name: /close/i }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("modal closes on Escape key", async ({ page }) => {
  await openModal(page);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("step 3 Continue is disabled until 10+ characters are typed", async ({
  page,
}) => {
  await openModal(page);
  // Step 1 → 2
  await page.getByRole("button", { name: /continue/i }).click();
  // Step 2: pick a category → 3
  await page.getByRole("button", { name: "UX" }).click();
  await page.getByRole("button", { name: /continue/i }).click();
  // Step 3: Continue should be disabled with no text
  const continueBtn = page.getByRole("button", { name: /continue/i });
  await expect(continueBtn).toBeDisabled();
  // Type fewer than 10 chars — still disabled
  await page.getByLabel(/your feedback/i).fill("short");
  await expect(continueBtn).toBeDisabled();
  // Type 10+ chars — enabled
  await page.getByLabel(/your feedback/i).fill("long enough message here");
  await expect(continueBtn).toBeEnabled();
});

test("step 4 shows validation error for invalid email on blur", async ({
  page,
}) => {
  await openModal(page);
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByRole("button", { name: "Design" }).click();
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByLabel(/your feedback/i).fill("This is a detailed feedback message.");
  await page.getByRole("button", { name: /continue/i }).click();
  // Step 4: type invalid email and blur
  await page.getByLabel(/your email/i).fill("not-an-email");
  await page.getByLabel(/your email/i).blur();
  await expect(
    page.getByRole("alert").filter({ hasText: /valid email/i })
  ).toBeVisible();
});

test("full happy path — mocked API — reaches success screen", async ({
  page,
}) => {
  await page.route("/api/feedback", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
  );

  await openModal(page);
  // Step 1
  await page.getByRole("button", { name: /continue/i }).click();
  // Step 2: category
  await page.getByRole("button", { name: "General thoughts" }).click();
  await page.getByRole("button", { name: /continue/i }).click();
  // Step 3: message
  await page
    .getByLabel(/your feedback/i)
    .fill("Playwright E2E test — happy path smoke check.");
  await page.getByRole("button", { name: /continue/i }).click();
  // Step 4: submit (no optional fields)
  await page.getByRole("button", { name: /send/i }).click();
  // Step 5: success
  await expect(page.getByText("Thank you.")).toBeVisible();
});

test("Tree-Nation link is present and points to tree-nation.com", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#forest").scrollIntoViewIfNeeded();
  const link = page
    .locator("#forest")
    .getByRole("link")
    .filter({ hasText: /tree.nation/i })
    .or(
      page
        .locator("#forest")
        .getByRole("link", { name: /living forest|view/i })
    )
    .first();
  const href = await link.getAttribute("href");
  expect(href).toMatch(/tree-nation\.com/);
});
