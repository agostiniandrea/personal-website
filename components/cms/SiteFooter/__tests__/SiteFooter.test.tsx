import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BREAKPOINTS_BELOW } from "@constants";
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
    // The static Green Web badge is the only remaining link.
    const links = screen.queryAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName(/green hosting/i);
  });

  it("shows the Climate Action label, then Green Web, in the badge row", () => {
    renderWithTheme(<SiteFooter {...defaultSiteFooter} />);
    const climate = screen.getByTestId("tree-nation-offset-website");
    const green = screen.getByRole("link", { name: /green hosting/i });
    const tagline = screen.getByText(/one component at a time/i);

    expect(climate.parentElement).toContainElement(green);
    expect(
      climate.compareDocumentPosition(green) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    // The tagline sits in the bottom row, not with the badges.
    expect(climate.parentElement).not.toContainElement(tagline);
  });

  it("shows the symbol on the right, above the copyright name, hidden from assistive tech", () => {
    const { container } = renderWithTheme(
      <SiteFooter {...defaultSiteFooter} />,
    );
    const logo = container.querySelector("svg");
    const copyright = screen.getByText(/©/);
    const tagline = screen.getByText(/one component at a time/i);

    expect(logo).not.toBeNull();
    expect(logo?.closest("[aria-hidden='true']")).not.toBeNull();
    expect(screen.queryByRole("img", { name: /Agostini/i })).toBeNull();
    expect(copyright.parentElement).toContainElement(logo as SVGSVGElement);
    expect(tagline.parentElement).not.toContainElement(logo as SVGSVGElement);
    const position = logo?.compareDocumentPosition(copyright) ?? 0;
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
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

  it("shows the Climate Action label in its default light/dark theme", () => {
    renderWithTheme(<SiteFooter {...defaultSiteFooter} />);
    const climate = screen
      .getByTestId("tree-nation-offset-website")
      .querySelector("[data-theme]")!;

    // Never a monochrome theme.
    expect(climate.getAttribute("data-theme")).toMatch(/^(light|dark)$/);
  });

  it("hides the whole footer, environmental badges included, on mobile", () => {
    renderWithTheme(<SiteFooter {...defaultSiteFooter} />);
    expect(screen.getByRole("contentinfo")).toHaveStyleRule("display", "none", {
      media: `(max-width: ${BREAKPOINTS_BELOW.xTablet})`,
    });
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

  it("introduces the three sustainability badges", () => {
    renderWithTheme(<SiteFooter {...defaultSiteFooter} />);

    expect(screen.getByText(/sustainable by design/i)).toBeInTheDocument();
    expect(
      screen.getByText(/runs on renewable energy and supports global/i),
    ).toBeInTheDocument();
  });
});
