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

  it("draws the lettering in the brand teal, like the circle", () => {
    render(<BrandLogo label="Andrea Agostini" />);
    expect(screen.getByTestId("brand-logo-lettering")).toHaveAttribute(
      "fill",
      "#306F6B",
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
    expect(screen.getByTestId("brand-logo-symbol")).toHaveAttribute(
      "fill",
      "#306F6B",
    );
  });
});
