import { screen } from "@testing-library/react";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import GreenWebBadge from "../index";

describe("GreenWebBadge", () => {
  it("renders the self-hosted badge with the Foundation's alt text", () => {
    renderWithTheme(<GreenWebBadge />);

    const image = screen.getByRole("img", { name: /green hosting/i });
    expect(image).toHaveAttribute("src", "/assets/green-hosting-badge.png");
    expect(image).toHaveAttribute("width", "200");
    expect(image).toHaveAttribute("height", "95");
  });

  it("links to the live Green Web check for this domain", () => {
    renderWithTheme(<GreenWebBadge />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "https://www.thegreenwebfoundation.org/green-web-check/?url=agostiniandrea.dev",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not hotlink the image from app.greenweb.org", () => {
    const { container } = renderWithTheme(<GreenWebBadge />);

    expect(container.querySelector('img[src*="greenweb.org"]')).toBeNull();
  });
});
