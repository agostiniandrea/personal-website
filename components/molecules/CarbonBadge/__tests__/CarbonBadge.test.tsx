import { screen } from "@testing-library/react";

import { WEBSITE_CARBON } from "@constants";
import { renderWithTheme } from "@test-utils/renderWithTheme";

import CarbonBadge from "../index";

describe("CarbonBadge", () => {
  it("renders the stored emissions value statically", () => {
    const { container } = renderWithTheme(<CarbonBadge />);

    expect(
      screen.getByText(`${WEBSITE_CARBON.emissions}${WEBSITE_CARBON.unit}`),
    ).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });

  it("links to Website Carbon with an accessible label", () => {
    renderWithTheme(<CarbonBadge />);

    const link = screen.getByRole("link", { name: /Website Carbon result/i });
    expect(link).toHaveAttribute("href", WEBSITE_CARBON.resultUrl);
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not inject any external script", () => {
    renderWithTheme(<CarbonBadge />);

    expect(
      document.querySelector('script[src*="website-carbon-badges"]'),
    ).not.toBeInTheDocument();
  });
});
