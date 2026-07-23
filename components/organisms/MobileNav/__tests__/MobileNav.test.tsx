import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { createMatchMediaMock } from "@test-utils/mockMatchMedia";
import { renderWithTheme } from "@test-utils/renderWithTheme";

import MobileNav from "../index";

const defaultMatchMedia = window.matchMedia;

const setNavigationState = (mobileView: string, hash: string) => {
  window.history.replaceState(
    { mobileView, storySub: "journey" },
    "",
    `/${hash}`,
  );
  act(() => {
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
};

describe("MobileNav", () => {
  beforeAll(() => {
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    window.history.replaceState(null, "", "/");
    window.matchMedia = defaultMatchMedia;
    document.documentElement.removeAttribute("data-mobile-view");
    document.documentElement.removeAttribute("data-story-sub");
  });

  it("renders the five destinations with accessible labels", () => {
    renderWithTheme(<MobileNav />);
    const nav = screen.getByTestId("mobile-nav");
    expect(nav).toHaveAttribute("aria-label", "Mobile navigation");
    ["Home", "Work", "Story", "Forest", "More"].forEach((label) => {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    });
  });

  it("marks Home as current by default and syncs the html attribute", () => {
    renderWithTheme(<MobileNav />);
    expect(screen.getByRole("button", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(document.documentElement.getAttribute("data-mobile-view")).toBe(
      "home",
    );
  });

  it.each([
    ["#about", "Home", "home"],
    ["#work", "Work", "work"],
    ["#journey", "Story", "story"],
    ["#experience", "Story", "story"],
    ["#forest", "Forest", "forest"],
    ["#skills", "More", "skills"],
  ])(
    "activates the right destination for deep link %s",
    (hash, label, view) => {
      window.history.replaceState(null, "", `/${hash}`);
      renderWithTheme(<MobileNav />);
      expect(screen.getByRole("button", { name: label })).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(document.documentElement.getAttribute("data-mobile-view")).toBe(
        view,
      );
    },
  );

  it("resolves the story subview from the hash", () => {
    window.history.replaceState(null, "", "/#experience");
    renderWithTheme(<MobileNav />);
    expect(document.documentElement.getAttribute("data-story-sub")).toBe(
      "experience",
    );
  });

  it("removes the hash for Home while preserving path and query", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/it?preview=1#forest");
    renderWithTheme(<MobileNav />);
    await user.click(screen.getByRole("button", { name: "Home" }));
    expect(window.location.pathname).toBe("/it");
    expect(window.location.search).toBe("?preview=1");
    expect(window.location.hash).toBe("");
  });

  it("falls back from an unknown mobile hash to the canonical root", () => {
    window.matchMedia = createMatchMediaMock(true);
    window.history.replaceState(null, "", "/?preview=1#unknown");
    renderWithTheme(<MobileNav />);
    expect(window.location.pathname).toBe("/");
    expect(window.location.search).toBe("?preview=1");
    expect(window.location.hash).toBe("");
    expect(document.documentElement).toHaveAttribute(
      "data-mobile-view",
      "home",
    );
  });

  it("navigates on tab click with its canonical hash and history state", async () => {
    const user = userEvent.setup();
    renderWithTheme(<MobileNav />);
    await user.click(screen.getByRole("button", { name: "Work" }));
    expect(window.location.hash).toBe("#work");
    expect(window.history.state).toEqual(
      expect.objectContaining({ mobileView: "work", storySub: "journey" }),
    );
    expect(document.documentElement.getAttribute("data-mobile-view")).toBe(
      "work",
    );
    expect(screen.getByRole("button", { name: "Work" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("restores the previous view on popstate (Back/Forward)", async () => {
    const user = userEvent.setup();
    renderWithTheme(<MobileNav />);
    await user.click(screen.getByRole("button", { name: "Forest" }));
    expect(document.documentElement.getAttribute("data-mobile-view")).toBe(
      "forest",
    );
    setNavigationState("work", "#work");
    expect(document.documentElement.getAttribute("data-mobile-view")).toBe(
      "work",
    );
    expect(screen.getByRole("button", { name: "Work" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  describe("More sheet", () => {
    it("opens on More, lists destinations, and navigates", async () => {
      const user = userEvent.setup();
      renderWithTheme(<MobileNav cvDownloadUrl="https://example.com/cv.pdf" />);
      await user.click(screen.getByRole("button", { name: "More" }));
      expect(window.location.hash).toBe("#more");
      const sheet = screen.getByTestId("more-sheet");
      expect(sheet).toHaveAttribute("role", "dialog");
      expect(
        screen.getByRole("link", { name: /download cv/i }),
      ).toHaveAttribute("href", "https://example.com/cv.pdf");
      await user.click(
        screen.getByRole("button", {
          name: /Skills & tools Technologies and practices/i,
        }),
      );
      expect(screen.queryByTestId("more-sheet")).not.toBeInTheDocument();
      expect(document.documentElement.getAttribute("data-mobile-view")).toBe(
        "skills",
      );
      expect(window.location.hash).toBe("#skills");
      expect(window.history.state).toEqual(
        expect.objectContaining({ mobileView: "skills" }),
      );
      expect(screen.getByRole("button", { name: "More" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });

    it("marks More as current while the sheet is open and includes Experience", async () => {
      const user = userEvent.setup();
      renderWithTheme(<MobileNav />);
      await user.click(screen.getByRole("button", { name: "More" }));
      expect(screen.getByRole("button", { name: "More" })).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(
        screen.getByRole("button", { name: /Experience Where I've worked/i }),
      ).toBeInTheDocument();
    });

    it("closes on Escape and on backdrop click", async () => {
      const user = userEvent.setup();
      renderWithTheme(<MobileNav />);
      await user.click(screen.getByRole("button", { name: "More" }));
      await user.keyboard("{Escape}");
      expect(screen.queryByTestId("more-sheet")).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "More" }));
      await user.click(screen.getByTestId("more-backdrop"));
      expect(screen.queryByTestId("more-sheet")).not.toBeInTheDocument();
    });

    it("offers the language switcher with the current locale pressed", async () => {
      const user = userEvent.setup();
      renderWithTheme(<MobileNav />);
      await user.click(screen.getByRole("button", { name: "More" }));
      expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(screen.getByRole("button", { name: "IT" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });
  });
});
