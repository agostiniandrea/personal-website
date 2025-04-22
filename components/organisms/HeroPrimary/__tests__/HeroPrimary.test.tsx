import React from "react";
import { screen } from "@testing-library/react";
import { renderWithTheme } from "@test-utils/renderWithTheme";
import HeroPrimary from "../index";

describe("HeroPrimary", () => {
  it("renders hero with title", () => {
    renderWithTheme(<HeroPrimary />);

    const title = screen.getByRole("heading", { name: "Our Blog" });
    expect(title).toBeInTheDocument();
    expect(title).toHaveStyle({
      color: "#fffffe",
    });
  });

  it("renders hero with description", () => {
    renderWithTheme(<HeroPrimary />);

    const description = screen.getByText(/Welcome to our blog/);
    expect(description).toBeInTheDocument();
    expect(description).toHaveStyle({
      color: expect.stringContaining("rgb"),
    });
  });

  it("renders hero with image", () => {
    renderWithTheme(<HeroPrimary />);

    const image = screen.getByRole("img", {
      name: "An image that captures the essence of our blog, showcasing meaningful moments from our stories",
    });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/images/hero.jpg");
  });
});
