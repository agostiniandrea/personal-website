import { act, screen, within } from "@testing-library/react";
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
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 0,
      writable: true,
    });
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

    it("opens the picked destination at the top, not at the sheet's scroll position", async () => {
      const user = userEvent.setup();
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        value: 500,
        writable: true,
      });
      renderWithTheme(<MobileNav />);
      await user.click(screen.getByRole("button", { name: "More" }));
      (window.scrollTo as jest.Mock).mockClear();
      await user.click(
        screen.getByRole("button", {
          name: /Skills & tools Technologies and practices/i,
        }),
      );
      expect(window.scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ top: 0 }),
      );
      // must never bounce back to where the page was when the sheet opened
      expect(window.scrollTo).not.toHaveBeenCalledWith(
        expect.objectContaining({ top: 500 }),
      );
    });

    it("restores the scroll position on a plain dismiss", async () => {
      const user = userEvent.setup();
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        value: 500,
        writable: true,
      });
      renderWithTheme(<MobileNav />);
      await user.click(screen.getByRole("button", { name: "More" }));
      (window.scrollTo as jest.Mock).mockClear();
      await user.keyboard("{Escape}");
      expect(window.scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ top: 500 }),
      );
    });

    it("marks More as current while open and leaves Experience to Story", async () => {
      const user = userEvent.setup();
      renderWithTheme(<MobileNav />);
      await user.click(screen.getByRole("button", { name: "More" }));
      expect(screen.getByRole("button", { name: "More" })).toHaveAttribute(
        "aria-current",
        "page",
      );
      // Experience lives under the Story tab, so the sheet must not repeat it
      expect(
        screen.queryByRole("button", { name: /Experience Where I've worked/i }),
      ).not.toBeInTheDocument();
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

    it("keeps the tab bar operable while the sheet is open", async () => {
      const user = userEvent.setup();
      renderWithTheme(<MobileNav />);
      await user.click(screen.getByRole("button", { name: "More" }));
      expect(screen.getByTestId("mobile-nav").closest("[inert]")).toBeNull();

      await user.click(screen.getByRole("button", { name: "Forest" }));
      expect(screen.queryByTestId("more-sheet")).not.toBeInTheDocument();
      expect(document.documentElement.getAttribute("data-mobile-view")).toBe(
        "forest",
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

    describe("social links", () => {
      const socialLinks = [
        { label: "LinkedIn", url: "https://linkedin.com/in/agostiniandrea" },
        { label: "GitHub", url: "https://github.com/agostiniandrea" },
        { label: "Email", url: "mailto:a.agostini92@gmail.com" },
      ];

      const openSheet = async (links = socialLinks) => {
        window.matchMedia = createMatchMediaMock(true);
        const user = userEvent.setup();
        renderWithTheme(<MobileNav socialLinks={links} />);
        await user.click(screen.getByRole("button", { name: "More" }));
        return { user, sheet: screen.getByTestId("more-sheet") };
      };

      afterEach(() => {
        delete window.gtag;
      });

      it("lists LinkedIn, GitHub and Email with their real hrefs", async () => {
        const { sheet } = await openSheet();
        socialLinks.forEach(({ label, url }) => {
          const link = within(sheet).getByRole("link", { name: label });
          expect(link).toHaveAttribute("href", url);
          expect(link).toBeVisible();
        });
      });

      it("opens web profiles in a new tab, but never mailto: links", async () => {
        const { sheet } = await openSheet();
        ["LinkedIn", "GitHub"].forEach((label) => {
          const link = within(sheet).getByRole("link", { name: label });
          expect(link).toHaveAttribute("target", "_blank");
          expect(link).toHaveAttribute("rel", "noopener noreferrer");
        });
        const email = within(sheet).getByRole("link", { name: "Email" });
        expect(email).not.toHaveAttribute("target");
        expect(email).not.toHaveAttribute("rel");
      });

      it("renders no social row when there are no links", async () => {
        const { sheet } = await openSheet([]);
        expect(
          within(sheet).queryByRole("link", { name: "GitHub" }),
        ).not.toBeInTheDocument();
      });

      it("leaves a click on each link to the browser: nothing intercepts it", async () => {
        const { user, sheet } = await openSheet();
        // Recorded at the document in the bubble phase, after MobileNav's own
        // capture-phase handler and React's, then cancelled so jsdom does not
        // try to navigate.
        const intercepted: Record<string, boolean> = {};
        const record = (event: MouseEvent) => {
          const href = (event.target as Element)
            .closest("a")
            ?.getAttribute("href");
          if (href) intercepted[href] = event.defaultPrevented;
          event.preventDefault();
        };
        document.addEventListener("click", record);

        for (const { label } of socialLinks) {
          await user.click(within(sheet).getByRole("link", { name: label }));
        }
        document.removeEventListener("click", record);

        expect(intercepted).toEqual({
          "https://linkedin.com/in/agostiniandrea": false,
          "https://github.com/agostiniandrea": false,
          "mailto:a.agostini92@gmail.com": false,
        });
      });

      it("keeps the sheet open and reports the click without sending the URL", async () => {
        const { user, sheet } = await openSheet();
        window.gtag = jest.fn();
        const stop = (event: MouseEvent) => event.preventDefault();
        document.addEventListener("click", stop);

        await user.click(within(sheet).getByRole("link", { name: "GitHub" }));
        await user.click(within(sheet).getByRole("link", { name: "Email" }));
        document.removeEventListener("click", stop);

        expect(window.gtag).toHaveBeenCalledWith(
          "event",
          "social_profile_clicked",
          { location: "more", platform: "github" },
        );
        expect(window.gtag).toHaveBeenCalledWith("event", "contact_clicked", {
          location: "more",
          method: "email",
        });
        expect(screen.getByTestId("more-sheet")).toBeInTheDocument();
      });
    });
  });
});
