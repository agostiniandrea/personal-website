import { expect,test } from "./fixtures";

type CapturedAnalyticsEvent = ["event", string, Record<string, string>];

async function installAnalyticsSpy(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    const analyticsWindow = window as typeof window & {
      capturedAnalyticsEvents: CapturedAnalyticsEvent[];
    };
    analyticsWindow.capturedAnalyticsEvents = [];
    window.gtag = (command, eventName, params = {}) => {
      analyticsWindow.capturedAnalyticsEvents.push([command, eventName, params]);
    };
  });
}

const capturedEvents = (page: import("@playwright/test").Page) =>
  page.evaluate(() =>
    (window as typeof window & {
      capturedAnalyticsEvents: CapturedAnalyticsEvent[];
    }).capturedAnalyticsEvents
  );

const feedbackDialog = (page: import("@playwright/test").Page) =>
  page.getByRole("dialog", { name: "Share feedback" });

async function openModal(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.locator("#forest").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /leave a leaf/i }).click();
  await expect(feedbackDialog(page)).toBeVisible();
}

test("Forest CTA opens the feedback modal", async ({ page }) => {
  await installAnalyticsSpy(page);
  await openModal(page);
  expect(await capturedEvents(page)).toContainEqual([
    "event",
    "feedback_modal_opened",
    { locale: "en" },
  ]);
});

test("modal closes when the X button is clicked", async ({ page }) => {
  await openModal(page);
  await feedbackDialog(page).getByRole("button", { name: /close/i }).click();
  await expect(feedbackDialog(page)).not.toBeVisible();
});

test("modal closes on Escape key", async ({ page }) => {
  await openModal(page);
  await page.keyboard.press("Escape");
  await expect(feedbackDialog(page)).not.toBeVisible();
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
  await installAnalyticsSpy(page);
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
  expect(await capturedEvents(page)).not.toContainEqual([
    "event",
    "feedback_submitted",
    expect.anything(),
  ]);
  // Step 4: submit (no optional fields)
  await page.getByRole("button", { name: /send/i }).click();
  // Step 5: success
  await expect(page.getByText("Thank you.")).toBeVisible();
  expect(await capturedEvents(page)).toContainEqual([
    "event",
    "feedback_submitted",
    { feedback_category: "General thoughts", locale: "en" },
  ]);
});

test("failed feedback request does not record a submission", async ({ page }) => {
  await installAnalyticsSpy(page);
  await page.route("/api/feedback", (route) =>
    route.fulfill({ status: 500, body: JSON.stringify({ error: "Test failure" }) })
  );

  await openModal(page);
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByRole("button", { name: "UX" }).click();
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByLabel(/your feedback/i).fill("A valid message that should fail to submit.");
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByRole("button", { name: /send/i }).click();

  await expect(page.getByText(/something went wrong/i)).toBeVisible();
  expect((await capturedEvents(page)).filter(([, name]) => name === "feedback_submitted")).toHaveLength(0);
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
