import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import SiteFooter from "../index";
import { defaultSiteFooter, minimalSiteFooter } from "../model";

describe("SiteFooter", () => {
  it("renders correctly with social links", () => {
    const { container } = renderWithTheme(
      <SiteFooter {...defaultSiteFooter} />,
    );
    expect(container).toMatchSnapshot();
  });

  it("renders correctly with no social links", () => {
    const { container } = renderWithTheme(
      <SiteFooter {...minimalSiteFooter} />,
    );
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

  it("sets target=_blank on external links but not mailto links", () => {
    renderWithTheme(<SiteFooter {...defaultSiteFooter} />);
    defaultSiteFooter.socialLinks.forEach(({ label, url }) => {
      const link = screen.getByRole("link", { name: label });
      if (url.startsWith("mailto:")) {
        expect(link).not.toHaveAttribute("target", "_blank");
      } else {
        expect(link).toHaveAttribute("target", "_blank");
      }
    });
  });

  it("renders the copyright text with copyrightName", () => {
    renderWithTheme(<SiteFooter {...defaultSiteFooter} />);
    expect(
      screen.getByText(new RegExp(defaultSiteFooter.copyrightName)),
    ).toBeInTheDocument();
  });

  it("renders no social links when socialLinks is empty", () => {
    renderWithTheme(<SiteFooter {...minimalSiteFooter} />);
    // The static Website Carbon badge is the only remaining link
    const links = screen.queryAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName(/Website Carbon result/i);
  });

  it("stacks the Climate Action Website label on the left, above Website Carbon", () => {
    renderWithTheme(<SiteFooter {...defaultSiteFooter} />);
    const climate = screen.getByTestId("tree-nation-offset-website");
    const carbon = screen.getByRole("link", { name: /Website Carbon result/i });

    expect(climate.parentElement).toContainElement(carbon);
    expect(
      climate.compareDocumentPosition(carbon) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("has no Tree Counter in the footer: only the Climate Action label", () => {
    renderWithTheme(<SiteFooter {...defaultSiteFooter} />);
    const widgets = screen
      .getByRole("contentinfo")
      .querySelectorAll("[data-widget-type]");

    expect(widgets).toHaveLength(1);
    expect(widgets[0]).toHaveAttribute("data-widget-type", "offset-website");
    expect(screen.queryByTestId("tree-nation-tree-counter")).toBeNull();
  });

  it("tracks footer social profile clicks", async () => {
    const user = userEvent.setup();
    window.gtag = jest.fn();
    renderWithTheme(<SiteFooter {...defaultSiteFooter} />);

    await user.click(screen.getByRole("link", { name: "GitHub" }));

    expect(window.gtag).toHaveBeenCalledWith(
      "event",
      "social_profile_clicked",
      {
        location: "footer",
        platform: "github",
      },
    );
    delete window.gtag;
  });
});
