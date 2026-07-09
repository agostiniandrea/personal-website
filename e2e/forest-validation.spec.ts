import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const feedbackDialog = (page: Page) =>
  page.getByRole("dialog", { name: "Share feedback" });

const sendBtn = (page: Page) =>
  feedbackDialog(page).getByRole("button", { name: /send/i });

/** Navigate from step 1 through step 4 (the optional-fields screen). */
async function reachStep4(page: Page) {
  await page.goto("/");
  await page.locator("#forest").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /leave a leaf/i }).click();
  await expect(feedbackDialog(page)).toBeVisible();
  // Step 1 → 2
  await feedbackDialog(page).getByRole("button", { name: /continue/i }).click();
  // Step 2: pick category → 3
  await feedbackDialog(page).getByRole("button", { name: "UX" }).click();
  await feedbackDialog(page).getByRole("button", { name: /continue/i }).click();
  // Step 3: write message → 4
  await feedbackDialog(page)
    .getByLabel(/your feedback/i)
    .fill("This is a detailed feedback message for validation testing.");
  await feedbackDialog(page).getByRole("button", { name: /continue/i }).click();
  // Assert we're on step 4
  await expect(feedbackDialog(page).getByLabel(/your email/i)).toBeVisible();
}

// ── Happy paths ────────────────────────────────────────────────────────────────

test("step 4: Send enabled when all optional fields are empty", async ({
  page,
}) => {
  await page.route("/api/feedback", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
  );
  await reachStep4(page);
  // No fields filled — all optional, so Send should be enabled
  await expect(sendBtn(page)).toBeEnabled();
});

test("step 4: submitting with no optional fields reaches success screen", async ({
  page,
}) => {
  await page.route("/api/feedback", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
  );
  await reachStep4(page);
  await sendBtn(page).click();
  await expect(feedbackDialog(page).getByText("Thank you.")).toBeVisible();
});

test("step 4: name with only numbers is accepted (no format restriction)", async ({
  page,
}) => {
  await reachStep4(page);
  await feedbackDialog(page).getByLabel(/your name/i).fill("12345");
  await feedbackDialog(page).getByLabel(/your name/i).blur();
  await expect(sendBtn(page)).toBeEnabled();
});

test("step 4: valid email clears any existing error", async ({ page }) => {
  await reachStep4(page);
  const emailField = feedbackDialog(page).getByLabel(/your email/i);
  // Type invalid, blur to trigger error
  await emailField.fill("not-valid");
  await emailField.blur();
  await expect(feedbackDialog(page).getByRole("alert")).toBeVisible();
  // Fix it — error should disappear
  await emailField.fill("valid@example.com");
  await emailField.blur();
  await expect(feedbackDialog(page).getByRole("alert")).not.toBeVisible();
  await expect(sendBtn(page)).toBeEnabled();
});

// ── Invalid email ─────────────────────────────────────────────────────────────

test("step 4: plain text in email field shows error and disables Send", async ({
  page,
}) => {
  await reachStep4(page);
  await feedbackDialog(page).getByLabel(/your email/i).fill("notanemail");
  await feedbackDialog(page).getByLabel(/your email/i).blur();
  await expect(
    feedbackDialog(page).getByRole("alert").filter({ hasText: /valid email/i })
  ).toBeVisible();
  await expect(sendBtn(page)).toBeDisabled();
});

test("step 4: email missing @ shows error", async ({ page }) => {
  await reachStep4(page);
  await feedbackDialog(page).getByLabel(/your email/i).fill("andrea.gmail.com");
  await feedbackDialog(page).getByLabel(/your email/i).blur();
  await expect(
    feedbackDialog(page).getByRole("alert").filter({ hasText: /valid email/i })
  ).toBeVisible();
});

test("step 4: email missing domain shows error", async ({ page }) => {
  await reachStep4(page);
  await feedbackDialog(page).getByLabel(/your email/i).fill("andrea@");
  await feedbackDialog(page).getByLabel(/your email/i).blur();
  await expect(
    feedbackDialog(page).getByRole("alert").filter({ hasText: /valid email/i })
  ).toBeVisible();
});

// ── Invalid LinkedIn ──────────────────────────────────────────────────────────

test("step 4: plain text in LinkedIn field shows error", async ({ page }) => {
  await reachStep4(page);
  await feedbackDialog(page).getByLabel(/linkedin url/i).fill("andrea-agostini");
  await feedbackDialog(page).getByLabel(/linkedin url/i).blur();
  await expect(
    feedbackDialog(page)
      .getByRole("alert")
      .filter({ hasText: /linkedin/i })
  ).toBeVisible();
  await expect(sendBtn(page)).toBeDisabled();
});

test("step 4: a valid URL that is not linkedin.com shows error", async ({
  page,
}) => {
  await reachStep4(page);
  await feedbackDialog(page)
    .getByLabel(/linkedin url/i)
    .fill("https://twitter.com/andrea");
  await feedbackDialog(page).getByLabel(/linkedin url/i).blur();
  await expect(
    feedbackDialog(page)
      .getByRole("alert")
      .filter({ hasText: /linkedin/i })
  ).toBeVisible();
});

test("step 4: valid LinkedIn URL is accepted", async ({ page }) => {
  await reachStep4(page);
  await feedbackDialog(page)
    .getByLabel(/linkedin url/i)
    .fill("https://linkedin.com/in/andrea-agostini");
  await feedbackDialog(page).getByLabel(/linkedin url/i).blur();
  // No alert for LinkedIn
  await expect(
    feedbackDialog(page).getByRole("alert").filter({ hasText: /linkedin/i })
  ).not.toBeVisible();
  await expect(sendBtn(page)).toBeEnabled();
});

// ── Invalid GitHub ────────────────────────────────────────────────────────────

test("step 4: plain text in GitHub field shows error", async ({ page }) => {
  await reachStep4(page);
  await feedbackDialog(page).getByLabel(/github url/i).fill("andrea");
  await feedbackDialog(page).getByLabel(/github url/i).blur();
  await expect(
    feedbackDialog(page)
      .getByRole("alert")
      .filter({ hasText: /github/i })
  ).toBeVisible();
  await expect(sendBtn(page)).toBeDisabled();
});

test("step 4: valid GitHub URL is accepted", async ({ page }) => {
  await reachStep4(page);
  await feedbackDialog(page)
    .getByLabel(/github url/i)
    .fill("https://github.com/andreaagostini");
  await feedbackDialog(page).getByLabel(/github url/i).blur();
  await expect(
    feedbackDialog(page).getByRole("alert").filter({ hasText: /github/i })
  ).not.toBeVisible();
  await expect(sendBtn(page)).toBeEnabled();
});

// ── Invalid website ───────────────────────────────────────────────────────────

test("step 4: plain text in website field shows error", async ({ page }) => {
  await reachStep4(page);
  await feedbackDialog(page)
    .getByLabel(/website url/i)
    .fill("mywebsite");
  await feedbackDialog(page).getByLabel(/website url/i).blur();
  await expect(
    feedbackDialog(page)
      .getByRole("alert")
      .filter({ hasText: /valid url/i })
  ).toBeVisible();
  await expect(sendBtn(page)).toBeDisabled();
});

test("step 4: website without protocol shows error", async ({ page }) => {
  await reachStep4(page);
  await feedbackDialog(page)
    .getByLabel(/website url/i)
    .fill("www.mysite.com");
  await feedbackDialog(page).getByLabel(/website url/i).blur();
  await expect(
    feedbackDialog(page)
      .getByRole("alert")
      .filter({ hasText: /valid url/i })
  ).toBeVisible();
});

test("step 4: valid website URL is accepted", async ({ page }) => {
  await reachStep4(page);
  await feedbackDialog(page)
    .getByLabel(/website url/i)
    .fill("https://mysite.com");
  await feedbackDialog(page).getByLabel(/website url/i).blur();
  await expect(
    feedbackDialog(page)
      .getByRole("alert")
      .filter({ hasText: /valid url/i })
  ).not.toBeVisible();
  await expect(sendBtn(page)).toBeEnabled();
});

// ── Multiple invalid fields ───────────────────────────────────────────────────

test("step 4: multiple invalid fields all show errors and block Send", async ({
  page,
}) => {
  await reachStep4(page);
  const dialog = feedbackDialog(page);
  await dialog.getByLabel(/your email/i).fill("bademail");
  await dialog.getByLabel(/your email/i).blur();
  await dialog.getByLabel(/linkedin url/i).fill("not-a-url");
  await dialog.getByLabel(/linkedin url/i).blur();
  await dialog.getByLabel(/github url/i).fill("also-not-a-url");
  await dialog.getByLabel(/github url/i).blur();
  // All three errors visible
  await expect(dialog.getByRole("alert")).toHaveCount(3);
  await expect(sendBtn(page)).toBeDisabled();
});

test("step 4: fixing all errors re-enables Send", async ({ page }) => {
  await page.route("/api/feedback", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
  );
  await reachStep4(page);
  const dialog = feedbackDialog(page);
  // Enter invalid values
  await dialog.getByLabel(/your email/i).fill("bad");
  await dialog.getByLabel(/your email/i).blur();
  await dialog.getByLabel(/linkedin url/i).fill("bad");
  await dialog.getByLabel(/linkedin url/i).blur();
  await expect(sendBtn(page)).toBeDisabled();
  // Fix them
  await dialog.getByLabel(/your email/i).fill("good@example.com");
  await dialog.getByLabel(/your email/i).blur();
  await dialog.getByLabel(/linkedin url/i).fill("https://linkedin.com/in/me");
  await dialog.getByLabel(/linkedin url/i).blur();
  await expect(sendBtn(page)).toBeEnabled();
});
