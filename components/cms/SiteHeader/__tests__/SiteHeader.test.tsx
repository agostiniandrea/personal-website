import { screen, fireEvent } from "@testing-library/react";
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
});
