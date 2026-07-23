import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { createMatchMediaMock } from "@test-utils/mockMatchMedia";
import { renderWithTheme } from "@test-utils/renderWithTheme";

import MobileNav from "../index";

const defaultMatchMedia = window.matchMedia;

const setNavigationState = (
  mobileView: string,
  storySub: "journey" | "experience" = "journey",
) => {
  window.history.replaceState(
    { mobileView, storySub, mobileMoreEntry: false },
    "",
    "/",
  );
  act(() => {
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
};

describe("MobileNav", () => {
  beforeAll(() => {
    Object.defineProperty(window, "scrollTo", {
      writable: true,
      value: jest.fn(),
    });
  });

  beforeEach(() => {
    window.matchMedia = createMatchMediaMock(true);
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
  });

  afterEach(() => {
    window.history.replaceState(null, "", "/");
    window.matchMedia = defaultMatchMedia;
    document.documentElement.removeAttribute("data-mobile-view");
    document.documentElement.removeAttribute("data-story-sub");
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 0,
    });
  });

  it("renders the five destinations with accessible labels", () => {
    renderWithTheme(<MobileNav />);
    const nav = screen.getByTestId("mobile-nav");
    expect(nav).toHaveAttribute("aria-label", "Mobile navigation");
    ["Home", "Work", "Story", "Forest", "More"].forEach((label) => {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    });
  });

  it("does not render or expose mobile navigation on desktop", () => {
    window.matchMedia = createMatchMediaMock(false);
    renderWithTheme(<MobileNav />);
    expect(screen.queryByTestId("mobile-nav")).not.toBeInTheDocument();
    expect(screen.queryByTestId("more-sheet")).not.toBeInTheDocument();
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

  it("opens Home and removes hashes on a fresh mobile document", () => {
    window.history.replaceState(null, "", "/#skills");
    renderWithTheme(<MobileNav />);
    expect(screen.getByRole("button", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(document.documentElement).toHaveAttribute(
      "data-mobile-view",
      "home",
    );
    expect(window.location.hash).toBe("");
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

  it("navigates with history state without changing the public URL", async () => {
    const user = userEvent.setup();
    renderWithTheme(<MobileNav />);
    await user.click(screen.getByRole("button", { name: "Work" }));
    expect(window.location.pathname).toBe("/");
    expect(window.location.hash).toBe("");
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
    setNavigationState("work");
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
      expect(window.location.hash).toBe("");
      expect(window.history.state).toEqual(
        expect.objectContaining({ mobileMoreEntry: true }),
      );
      expect(document.body).toHaveStyle({ overflow: "hidden" });
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
      expect(window.location.hash).toBe("");
      expect(window.history.state).toEqual(
        expect.objectContaining({ mobileView: "skills" }),
      );
      expect(screen.getByRole("button", { name: "More" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });

    it("marks More as current while the sheet is open and lists the current destinations", async () => {
      const user = userEvent.setup();
      renderWithTheme(<MobileNav />);
      await user.click(screen.getByRole("button", { name: "More" }));

      expect(screen.getByRole("button", { name: "More" })).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(
        screen.getByRole("button", { name: /Skills & tools/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", {
          name: /Sustainability Values and action/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", {
          name: /Beyond code Life, travel and passions/i,
        }),
      ).toBeInTheDocument();
    });

    it("closes the sheet when More is tapped again", async () => {
      const user = userEvent.setup();
      renderWithTheme(<MobileNav />);
      const moreButton = screen.getByRole("button", { name: "More" });

      expect(moreButton).toHaveAttribute("aria-expanded", "false");

      await user.click(moreButton);
      expect(screen.getByTestId("more-sheet")).toBeInTheDocument();
      expect(moreButton).toHaveAttribute("aria-expanded", "true");

      await user.click(moreButton);
      expect(screen.queryByTestId("more-sheet")).not.toBeInTheDocument();
      expect(moreButton).toHaveAttribute("aria-expanded", "false");
    });

    it("keeps Story on the journey subview when navigating to More and back", async () => {
      const user = userEvent.setup();
      renderWithTheme(<MobileNav />);
      await user.click(screen.getByRole("button", { name: "Story" }));

      expect(document.documentElement).toHaveAttribute(
        "data-story-sub",
        "journey",
      );

      await user.click(screen.getByRole("button", { name: "More" }));
      await user.click(screen.getByRole("button", { name: "Story" }));

      expect(window.location.hash).toBe("");
      expect(document.documentElement).toHaveAttribute(
        "data-mobile-view",
        "story",
      );
      expect(document.documentElement).toHaveAttribute(
        "data-story-sub",
        "journey",
      );
      expect(screen.getByRole("button", { name: "Story" })).toHaveAttribute(
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

    it("inerts the background but keeps the tab bar operable, traps focus, and restores it", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <>
          <main data-testid="bg-content">background</main>
          <MobileNav />
        </>,
      );
      container.id = "__next";
      const moreButton = screen.getByRole("button", { name: "More" });
      const background = screen.getByTestId("bg-content");
      const tabBar = screen.getByTestId("mobile-nav");

      await user.click(moreButton);

      expect(screen.getByTestId("more-sheet")).toHaveAttribute(
        "aria-label",
        "Mobile navigation menu",
      );
      // background is inert, but the tab bar (the sheet's trigger) is not, so
      // tapping another tab or More still works while the sheet is open
      expect(background).toHaveAttribute("inert");
      expect(background).toHaveAttribute("aria-hidden", "true");
      expect(tabBar).not.toHaveAttribute("inert");
      expect(tabBar.closest("[inert]")).toBeNull();
      expect(screen.getByRole("button", { name: "Close menu" })).toHaveFocus();

      await user.keyboard("{Escape}");

      expect(background).not.toHaveAttribute("inert");
      expect(background).not.toHaveAttribute("aria-hidden");
      expect(moreButton).toHaveFocus();
    });

    it("locks the page without losing its scroll position", async () => {
      const user = userEvent.setup();
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        value: 420,
      });
      renderWithTheme(<MobileNav />);

      await user.click(screen.getByRole("button", { name: "More" }));

      expect(document.body).toHaveStyle({
        overflow: "hidden",
        position: "fixed",
        top: "-420px",
        width: "100%",
      });
      await user.keyboard("{Escape}");

      expect(document.body.style.position).toBe("");
      expect(document.body.style.top).toBe("");
      expect(window.scrollTo).toHaveBeenLastCalledWith({
        behavior: "auto",
        left: 0,
        top: 420,
      });
    });

    it("closes through history and restores the previous primary view", async () => {
      const user = userEvent.setup();
      renderWithTheme(<MobileNav />);
      await user.click(screen.getByRole("button", { name: "Work" }));
      await user.click(screen.getByRole("button", { name: "More" }));
      expect(screen.getByTestId("more-sheet")).toBeInTheDocument();

      setNavigationState("work");

      expect(screen.queryByTestId("more-sheet")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Work" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });

    it("preserves a secondary More view when switching locale", async () => {
      const user = userEvent.setup();
      renderWithTheme(<MobileNav />);
      await user.click(screen.getByRole("button", { name: "More" }));
      await user.click(
        screen.getByRole("button", {
          name: /Sustainability Values and action/i,
        }),
      );
      await user.click(screen.getByRole("button", { name: "More" }));
      await user.click(screen.getByRole("button", { name: "IT" }));

      expect(window.location.pathname).toBe("/it");
      expect(window.location.hash).toBe("");
      expect(window.history.state).toEqual(
        expect.objectContaining({
          mobileMoreEntry: false,
          mobileView: "sustainability",
        }),
      );
      expect(document.documentElement).toHaveAttribute(
        "data-mobile-view",
        "sustainability",
      );
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
