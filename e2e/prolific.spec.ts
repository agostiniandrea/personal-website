import { expect, test } from "./fixtures";

/* The link Prolific hands a participant. Nothing about the site may change
   because of it, beyond the ids being remembered for the tab. */
const PID = "5f2a1b9c4d3e2f1a0b9c8d7e";
const STUDY_URL = `/?PROLIFIC_PID=${PID}&STUDY_ID=60d5f8a2b1c3d4e5f6a7b8c9&SESSION_ID=70e6a9b3c2d4e5f6a7b8c9d0`;

const storedSession = (page: import("@playwright/test").Page) =>
  page.evaluate(() => sessionStorage.getItem("prolific-session"));

/* Capture happens in a mount effect, so `goto` resolving on load is too early.
   Waiting for the value itself is the honest signal that it landed. */
const waitForCapture = (page: import("@playwright/test").Page) =>
  page.waitForFunction(() => sessionStorage.getItem("prolific-session") !== null);

/* For asserting the absence of a capture, wait on something else the homepage
   writes on mount — MobileFeedbackNudge's clock — so hydration is known to
   have happened before concluding that nothing was stored. */
const waitForHydration = (page: import("@playwright/test").Page) =>
  page.waitForFunction(
    () => sessionStorage.getItem("forest-feedback-nudge-started-at") !== null,
  );

test("a participant lands on the homepage, not on the Forest", async ({
  page,
}) => {
  await page.goto(STUDY_URL);

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  /* The point of the study: they explore from the top like anyone else. */
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test("the study parameters are remembered for the tab", async ({ page }) => {
  await page.goto(STUDY_URL);
  await waitForCapture(page);

  expect(JSON.parse((await storedSession(page)) ?? "null")).toEqual({
    prolificPid: PID,
    studyId: "60d5f8a2b1c3d4e5f6a7b8c9",
    sessionId: "70e6a9b3c2d4e5f6a7b8c9d0",
  });
});

test("an ordinary visit stores nothing", async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);

  expect(await storedSession(page)).toBeNull();
});

test("the participant id is never rendered on the page", async ({ page }) => {
  await page.goto(STUDY_URL);

  expect(await page.locator("body").innerText()).not.toContain(PID);
  expect(await page.content()).not.toContain(PID);
});

test("desktop navigation keeps the parameters in the URL", async ({ page }) => {
  await page.goto(STUDY_URL);
  await page.getByRole("link", { name: /forest/i }).first().click();

  await expect(page).toHaveURL(new RegExp(`PROLIFIC_PID=${PID}`));
});

test("the parameters survive a reload", async ({ page }) => {
  await page.goto(STUDY_URL);
  await waitForCapture(page);
  await page.reload();
  await waitForCapture(page);

  expect(await storedSession(page)).toContain(PID);
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("tab navigation keeps the parameters in the URL", async ({ page }) => {
    await page.goto(STUDY_URL);
    await page.getByRole("button", { name: /forest/i }).first().click();

    await expect(page).toHaveURL(new RegExp(`PROLIFIC_PID=${PID}`));
    await expect(page).toHaveURL(/#forest/);
  });
});
