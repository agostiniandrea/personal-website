import { fireEvent,screen } from "@testing-library/react";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import SiteHeader from "../index";
import { defaultSiteHeader, minimalSiteHeader } from "../model";

describe("SiteHeader", () => {
  it("renders correctly with all nav links", () => {
    const { container } = renderWithTheme(<SiteHeader {...defaultSiteHeader} />);
    expect(container).toMatchSnapshot();
  });

  it("renders correctly with no nav links", () => {
    const { container } = renderWithTheme(<SiteHeader {...minimalSiteHeader} />);
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

  it("renders nav links with correct hrefs (desktop + drawer)", () => {
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
      expect(screen.queryAllByRole("link", { name: label, hidden: true })).toHaveLength(0);
    });
  });

  it("renders a header element", () => {
    renderWithTheme(<SiteHeader {...defaultSiteHeader} />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders a hamburger button", () => {
    renderWithTheme(<SiteHeader {...defaultSiteHeader} />);
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
  });

  it("sets aria-expanded=true on hamburger when clicked", () => {
    renderWithTheme(<SiteHeader {...defaultSiteHeader} />);
    const hamburger = screen.getByRole("button", { name: "Open menu" });
    expect(hamburger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(hamburger);
    expect(hamburger).toHaveAttribute("aria-expanded", "true");
  });

  it("sets aria-expanded=false when drawer is closed", () => {
    renderWithTheme(<SiteHeader {...defaultSiteHeader} />);
    const hamburger = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(hamburger);
    fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
    expect(hamburger).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps closed drawer controls out of the accessibility tree", () => {
    renderWithTheme(<SiteHeader {...defaultSiteHeader} />);

    expect(screen.queryByRole("dialog", { name: "Navigation menu" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Close menu" })).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Mobile navigation" })).not.toBeInTheDocument();
  });

  it("moves focus into the drawer when it opens", () => {
    renderWithTheme(<SiteHeader {...defaultSiteHeader} />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveFocus();
  });

  it("closes on Escape and restores focus to the hamburger", () => {
    renderWithTheme(<SiteHeader {...defaultSiteHeader} />);
    const hamburger = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(hamburger);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog", { name: "Navigation menu" })).not.toBeInTheDocument();
    expect(hamburger).toHaveFocus();
  });

  it("wraps focus from the first to the last drawer control", () => {
    renderWithTheme(<SiteHeader {...defaultSiteHeader} />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const closeButton = screen.getByRole("button", { name: "Close menu" });
    const localeButton = screen.getByRole("button", { name: "Switch to Italian" });

    expect(closeButton).toHaveFocus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });

    expect(localeButton).toHaveFocus();
  });
});
