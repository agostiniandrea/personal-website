import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import MobileNav from "../index";

const setHash = (hash: string) => {
  window.history.replaceState(null, "", `/${hash}`);
  act(() => {
    window.dispatchEvent(new Event("hashchange"));
  });
};

describe("MobileNav", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
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
    ["#projects", "Work", "work"],
    ["#journey", "Story", "story"],
    ["#experience", "Story", "story"],
    ["#forest", "Forest", "forest"],
    ["#skills", "More", "skills"],
  ])("activates the right destination for deep link %s", (hash, label, view) => {
    window.history.replaceState(null, "", `/${hash}`);
    renderWithTheme(<MobileNav />);
    expect(screen.getByRole("button", { name: label })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(document.documentElement.getAttribute("data-mobile-view")).toBe(view);
  });

  it("resolves the story subview from the hash", () => {
    window.history.replaceState(null, "", "/#experience");
    renderWithTheme(<MobileNav />);
    expect(document.documentElement.getAttribute("data-story-sub")).toBe(
      "experience",
    );
  });

  it("navigates on tab click, updating hash and html attribute", async () => {
    const user = userEvent.setup();
    renderWithTheme(<MobileNav />);
    await user.click(screen.getByRole("button", { name: "Work" }));
    expect(window.location.hash).toBe("#projects");
    expect(document.documentElement.getAttribute("data-mobile-view")).toBe(
      "work",
    );
    expect(screen.getByRole("button", { name: "Work" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("restores the previous view on hashchange (Back/Forward)", async () => {
    const user = userEvent.setup();
    renderWithTheme(<MobileNav />);
    await user.click(screen.getByRole("button", { name: "Forest" }));
    expect(document.documentElement.getAttribute("data-mobile-view")).toBe(
      "forest",
    );
    setHash("#projects");
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
      const sheet = screen.getByTestId("more-sheet");
      expect(sheet).toHaveAttribute("role", "dialog");
      expect(screen.getByRole("link", { name: /download cv/i })).toHaveAttribute(
        "href",
        "https://example.com/cv.pdf",
      );
      await user.click(
        screen.getByRole("button", { name: "Skills & tools" }),
      );
      expect(screen.queryByTestId("more-sheet")).not.toBeInTheDocument();
      expect(document.documentElement.getAttribute("data-mobile-view")).toBe(
        "skills",
      );
      expect(window.location.hash).toBe("#skills");
      expect(screen.getByRole("button", { name: "More" })).toHaveAttribute(
        "aria-current",
        "page",
      );
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
