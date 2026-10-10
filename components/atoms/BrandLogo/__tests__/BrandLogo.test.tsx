import { render, screen } from "@testing-library/react";

import BrandLogo from "../BrandLogo";

describe("BrandLogo", () => {
  it("exposes the label as the accessible name", () => {
    render(<BrandLogo label="Andrea Agostini" />);
    expect(
      screen.getByRole("img", { name: "Andrea Agostini" }),
    ).toBeInTheDocument();
  });

  it("draws the name next to the symbol by default", () => {
    render(<BrandLogo label="Andrea Agostini" />);
    expect(screen.getByTestId("brand-logo-lettering")).toBeInTheDocument();
  });

  it("fills the lettering with the shine gradient", () => {
    render(<BrandLogo label="Andrea Agostini" />);
    const fill = screen
      .getByTestId("brand-logo-lettering")
      .getAttribute("fill");
    expect(fill).toMatch(/^url\(#logo-shine-\w+\)$/);
    const id = fill?.slice(5, -1) ?? "";
    expect(document.getElementById(id)?.tagName.toLowerCase()).toBe(
      "lineargradient",
    );
  });

  it("renders the symbol alone in a square box", () => {
    render(<BrandLogo label="Andrea Agostini" variant="mark" />);
    expect(screen.queryByTestId("brand-logo-lettering")).toBeNull();
    expect(screen.getByRole("img")).toHaveAttribute("viewBox", "0 0 1000 1000");
  });

  it("renders the flipped symbol alone: teal, no circle, no name", () => {
    const { container } = render(
      <BrandLogo label="Andrea Agostini" variant="symbol" />,
    );
    expect(container.querySelector("circle")).toBeNull();
    expect(screen.queryByTestId("brand-logo-lettering")).toBeNull();
    expect(
      screen.getByTestId("brand-logo-symbol").getAttribute("fill"),
    ).toMatch(/^url\(#logo-shine-\w+\)$/);
  });

  it("fills the disc with a gradient too, in every variant that has one", () => {
    const { container, rerender } = render(
      <BrandLogo label="Andrea Agostini" />,
    );
    expect(container.querySelector("circle")?.getAttribute("fill")).toMatch(
      /^url\(#logo-disc-\w+\)$/,
    );
    rerender(<BrandLogo label="Andrea Agostini" variant="mark" />);
    expect(container.querySelector("circle")?.getAttribute("fill")).toMatch(
      /^url\(#logo-disc-\w+\)$/,
    );
  });
});
