import { screen } from "@testing-library/react";
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

  it("renders all nav links with correct hrefs", () => {
    renderWithTheme(<SiteHeader {...defaultSiteHeader} />);
    defaultSiteHeader.navLinks.forEach(({ label, url }) => {
      const link = screen.getByRole("link", { name: label, hidden: true });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", url);
    });
  });

  it("renders no nav links when navLinks is empty", () => {
    renderWithTheme(<SiteHeader {...minimalSiteHeader} />);
    defaultSiteHeader.navLinks.forEach(({ label }) => {
      expect(screen.queryByRole("link", { name: label, hidden: true })).not.toBeInTheDocument();
    });
  });

  it("renders a header element", () => {
    renderWithTheme(<SiteHeader {...defaultSiteHeader} />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });
});
