import { useRouter } from "next/router";

import { screen } from "@testing-library/react";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import ThailandAnniversary from "../index";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe("ThailandAnniversary", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ locale: "en" });
  });

  it("names the anniversary with its dates", () => {
    renderWithTheme(<ThailandAnniversary />);
    const block = screen.getByTestId("thailand-anniversary");
    expect(block).toHaveTextContent("One year in Thailand");
    expect(block).toHaveTextContent("Oct 2025 — Oct 2026");
  });

  it("reads the dates out as a range, not as a dash", () => {
    renderWithTheme(<ThailandAnniversary />);
    expect(screen.getByText("October 2025 to October 2026")).toHaveClass(
      "sr-only",
    );
    expect(screen.getByText("Oct 2025 — Oct 2026")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("keeps the flag decorative and made of CSS only", () => {
    const { container } = renderWithTheme(<ThailandAnniversary />);
    const flag = container.querySelector('[aria-hidden="true"]');
    expect(flag).not.toBeNull();
    expect(flag).toHaveStyleRule(
      "background",
      expect.stringContaining("#a51931"),
    );
    expect(flag).toHaveStyleRule(
      "background",
      expect.stringContaining("#2d2a4a"),
    );
    expect(container.querySelector("img, svg, picture, video")).toBeNull();
  });

  it("carries no supporting sentence, in either form", () => {
    const { rerender } = renderWithTheme(<ThailandAnniversary />);
    expect(screen.queryByText(/new beginnings/)).not.toBeInTheDocument();
    rerender(<ThailandAnniversary variant="stacked" />);
    expect(screen.queryByText(/new beginnings/)).not.toBeInTheDocument();
    expect(screen.getByTestId("thailand-anniversary")).toHaveTextContent(
      "One year in Thailand",
    );
  });

  it("sets the title in the flag's navy token in the hero, and in gold under the Forest counter", () => {
    const { rerender } = renderWithTheme(<ThailandAnniversary />);
    expect(screen.getByText("One year in Thailand")).toHaveStyleRule(
      "color",
      "var(--color-thai-navy)",
    );
    rerender(<ThailandAnniversary variant="stacked" />);
    expect(screen.getByText("One year in Thailand")).toHaveStyleRule(
      "color",
      "var(--color-milestone)",
    );
  });

  it("speaks Italian", () => {
    mockUseRouter.mockReturnValue({ locale: "it" });
    renderWithTheme(<ThailandAnniversary />);
    const block = screen.getByTestId("thailand-anniversary");
    expect(block).toHaveTextContent("Un anno in Thailandia");
    expect(block).toHaveTextContent("Ott 2025 — Ott 2026");
    expect(
      screen.getByText("da ottobre 2025 a ottobre 2026"),
    ).toBeInTheDocument();
  });
});
