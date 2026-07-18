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
  const hrefs = await desktopNav.locator("a").evaluateAll((links) =>
    links.map((link) => link.getAttribute("href")),
  );
  expect(hrefs.indexOf("/#experience")).toBeLessThan(hrefs.indexOf("/#journey"));
});

test("site footer is present", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("contentinfo")).toBeAttached();
});

test("desktop Forest teaser is inline after Work and before Skills", async ({ page }) => {
  await page.goto("/");
  const teaser = page.getByTestId("forest-teaser");
  await expect(teaser).toBeVisible();
  await expect(teaser).toContainText("Thoughtful feedback grows into real trees.");
  await expect(teaser).toContainText(/trees planted through portfolio feedback/);
  await expect(
    page.locator("#projects ~ [data-testid='forest-teaser']"),
  ).toHaveCount(1);
  const order = await page.locator("#projects, [data-testid='forest-teaser'], #skills").evaluateAll(
    (elements) => elements.map((element) => element.id || element.getAttribute("data-testid")),
  );
  expect(order).toEqual(["projects", "forest-teaser", "skills"]);
});

test("desktop sections and keyboard dot navigation follow the approved order", async ({ page }) => {
  await page.goto("/");
  const sectionOrder = await page.locator("main > section[id]").evaluateAll(
    (sections) => sections.map((section) => section.id),
  );
  expect(sectionOrder).toEqual([
    "hero",
    "about",
    "projects",
    "skills",
    "experience",
    "journey",
    "sustainability",
    "beyond-code",
    "forest",
  ]);
  await expect(page.locator("main + footer[role='contentinfo']")).toBeAttached();

  const dotLabels = await page
    .getByRole("navigation", { name: "Section navigation" })
    .getByRole("button")
    .evaluateAll((buttons) => buttons.map((button) => button.getAttribute("aria-label")));
  expect(dotLabels).toEqual([
    "Go to Home",
    "Go to About",
    "Go to Projects",
    "Go to Skills",
    "Go to Experience",
    "Go to Journey",
    "Go to Sustainability",
    "Go to Beyond Code",
    "Go to Forest",
  ]);
});

test("feedback nudge suppresses back to top and clears project actions", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 700));
  const nudge = page.getByTestId("feedback-nudge");
  await expect(nudge).toBeVisible();
  await expect(page.getByRole("button", { name: "Scroll to top" })).toHaveCSS(
    "opacity",
    "0",
  );

  await page.locator("#projects").scrollIntoViewIfNeeded();
  await expect(nudge).toHaveCount(0);
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

  for (const width of [320, 375, 390, 430]) {
    test(`Italian More sheet stays within a ${width}px viewport`, async ({ page }) => {
      await page.setViewportSize({ width, height: 568 });
      await page.goto("/it");
      await page.getByRole("button", { name: "Altro" }).click();
      const dialog = page.getByRole("dialog", { name: "Esplora" });
      await expect(dialog).toBeVisible();
      const bounds = await dialog.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      expect(bounds!.y).toBeGreaterThanOrEqual(0);
      const navTop = await page.getByRole("navigation", { name: "Navigazione mobile" }).evaluate(
        (element) => element.getBoundingClientRect().top,
      );
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(navTop + 1);
      await expect(dialog.getByRole("heading", { name: "Esplora" })).toBeVisible();
      await expect(dialog.getByRole("button", { name: "Chiudi menu" })).toBeVisible();
    });
  }

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

  test("eligible feedback nudge keeps context and routes to Forest without opening the form", async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem(
        "forest-feedback-nudge-started-at",
        String(Date.now() - 36_000),
      );
      sessionStorage.setItem(
        "forest-feedback-nudge-visited",
        JSON.stringify(["home", "work"]),
      );
    });
    await page.goto("/#work");
    const nudge = page.getByTestId("mobile-feedback-nudge");
    await expect(nudge).toBeVisible();
    await nudge.getByRole("button", { name: /see how it grows/i }).click();
    await expect(page).toHaveURL(/\/#forest$/);
    await expect(page.locator("html")).toHaveAttribute("data-mobile-view", "forest");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("Journey shows location periods without ages in English and Italian", async ({ page }) => {
    await page.goto("/#journey");
    await expect(page.getByText("2025 – Now", { exact: true })).toBeVisible();
    for (const period of ["2019 – 2025", "2013 – 2018", "1992 – 2013"]) {
      await expect(page.getByText(period, { exact: true })).toBeVisible();
    }
    await expect(page.locator("#journey")).not.toContainText("y.o.");

    await page.goto("/it#journey");
    await expect(page.getByText("2025 – Oggi", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Torino" })).toBeVisible();
    const italianJourneyText = await page.locator("#journey").textContent();
    expect(italianJourneyText).not.toMatch(/\d+ anni ·/);
  });
});
