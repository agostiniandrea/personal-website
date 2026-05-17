import { screen } from "@testing-library/react";
import { renderWithTheme } from "@test-utils/renderWithTheme";
import SiteFooter from "../index";
import { defaultSiteFooter, minimalSiteFooter } from "../model";

describe("SiteFooter", () => {
  it("renders correctly with social links", () => {
    const { container } = renderWithTheme(<SiteFooter {...defaultSiteFooter} />);
    expect(container).toMatchSnapshot();
  });

  it("renders correctly with no social links", () => {
    const { container } = renderWithTheme(<SiteFooter {...minimalSiteFooter} />);
    expect(container).toMatchSnapshot();
  });

  it("renders the footer landmark", () => {
    renderWithTheme(<SiteFooter {...defaultSiteFooter} />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders all social links with correct href", () => {
    renderWithTheme(<SiteFooter {...defaultSiteFooter} />);
    defaultSiteFooter.socialLinks.forEach(({ label, url }) => {
      const link = screen.getByRole("link", { name: label });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", url);
    });
  });

  it("sets target=_blank on social links", () => {
    renderWithTheme(<SiteFooter {...defaultSiteFooter} />);
    defaultSiteFooter.socialLinks.forEach(({ label }) => {
      expect(screen.getByRole("link", { name: label })).toHaveAttribute(
        "target",
        "_blank",
      );
    });
  });

  it("renders the copyright text with copyrightName", () => {
    renderWithTheme(<SiteFooter {...defaultSiteFooter} />);
    expect(
      screen.getByText(new RegExp(defaultSiteFooter.copyrightName)),
    ).toBeInTheDocument();
  });

  it("renders no links when socialLinks is empty", () => {
    renderWithTheme(<SiteFooter {...minimalSiteFooter} />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });
});
