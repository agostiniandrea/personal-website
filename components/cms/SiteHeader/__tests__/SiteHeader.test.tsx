import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MobileNav from "@components/organisms/MobileNav";
import { createMatchMediaMock } from "@test-utils/mockMatchMedia";
import { renderWithTheme } from "@test-utils/renderWithTheme";

import SiteHeader from "../index";
import { defaultSiteHeader, minimalSiteHeader } from "../model";

const defaultMatchMedia = window.matchMedia;

describe("SiteHeader", () => {
  beforeAll(() => {
    Object.defineProperty(window, "scrollTo", {
      writable: true,
      value: jest.fn(),
    });
  });

  afterEach(() => {
    window.matchMedia = defaultMatchMedia;
    window.history.replaceState(null, "", "/");
    document.documentElement.removeAttribute("data-mobile-view");
    document.documentElement.removeAttribute("data-story-sub");
  });

  it("renders correctly with all nav links", () => {
    const { container } = renderWithTheme(
      <SiteHeader {...defaultSiteHeader} />,
    );
    expect(container).toMatchSnapshot();
  });

  it("renders correctly with no nav links", () => {
    const { container } = renderWithTheme(
      <SiteHeader {...minimalSiteHeader} />,
    );
    expect(container).toMatchSnapshot();
  });

  it("renders the logo text", () => {
    renderWithTheme(<SiteHeader {...defaultSiteHeader} />);
    expect(screen.getByText(defaultSiteHeader.logoText)).toBeInTheDocument();
  });

  it("renders the logo as a link to /", () => {
    renderWithTheme(<SiteHeader {...defaultSiteHeader} />);
    const logo = screen.getByText(defaultSiteHeader.logoText);
    expect(logo.tagName.toLowerCase()).toBe("a");
    expect(logo).toHaveAttribute("href", "/");
  });

  it("returns the mobile experience to Home when the logo is clicked", async () => {
    const user = userEvent.setup();
    window.matchMedia = createMatchMediaMock(true);
    window.history.replaceState(
      { mobileView: "story", storySub: "experience" },
      "",
      "/#experience",
    );
    document.documentElement.setAttribute("data-mobile-view", "story");
    document.documentElement.setAttribute("data-story-sub", "experience");

    renderWithTheme(
      <>
        <SiteHeader {...defaultSiteHeader} />
        <MobileNav />
      </>,
    );
    await user.click(screen.getByText(defaultSiteHeader.logoText));

    expect(window.location.hash).toBe("");
    expect(document.documentElement).toHaveAttribute(
      "data-mobile-view",
      "home",
    );
    expect(screen.getByRole("button", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("renders nav links with correct hrefs", () => {
    renderWithTheme(<SiteHeader {...defaultSiteHeader} />);
    defaultSiteHeader.navLinks.forEach(({ label, url }) => {
      const links = screen.getAllByRole("link", { name: label, hidden: true });
      expect(links.length).toBeGreaterThan(0);
      links.forEach((link) => expect(link).toHaveAttribute("href", url));
    });
  });

  it("renders no nav links when navLinks is empty", () => {
    renderWithTheme(<SiteHeader {...minimalSiteHeader} />);
    defaultSiteHeader.navLinks.forEach(({ label }) => {
      expect(
        screen.queryAllByRole("link", { name: label, hidden: true }),
      ).toHaveLength(0);
    });
  });

  it("renders a header element", () => {
    renderWithTheme(<SiteHeader {...defaultSiteHeader} />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("does not render a hamburger menu (mobile uses the bottom navigation)", () => {
    renderWithTheme(<SiteHeader {...defaultSiteHeader} />);
    expect(
      screen.queryByRole("button", { name: /open menu/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the locale switch button", () => {
    renderWithTheme(<SiteHeader {...defaultSiteHeader} />);
    expect(
      screen.getByRole("button", { name: /switch to italian/i }),
    ).toBeInTheDocument();
  });
});
