import React from "react";
import { screen } from "@testing-library/react";
import Text from "../index";
import { renderWithTheme } from "@test-utils/renderWithTheme";

describe("Text", () => {
  it("renders text with default styles", () => {
    renderWithTheme(<Text>Hello World</Text>);

    const text = screen.getByText("Hello World");
    expect(text).toBeInTheDocument();
    expect(text).toHaveStyle({
      color: "#b8c1ec",
    });
  });

  it("renders text with custom styles", () => {
    renderWithTheme(<Text style={{ color: "#fffffe" }}>Custom Text</Text>);

    const text = screen.getByText("Custom Text");
    expect(text).toHaveStyle({
      color: "#fffffe",
    });
  });

  it("renders text with custom className", () => {
    renderWithTheme(<Text className="custom-class">Class Text</Text>);

    const text = screen.getByText("Class Text");
    expect(text).toHaveClass("custom-class");
  });

  it("renders text with different variants", () => {
    renderWithTheme(
      <>
        <Text variant="small">Small Text</Text>
        <Text variant="large">Large Text</Text>
      </>,
    );

    const smallText = screen.getByText("Small Text");
    const largeText = screen.getByText("Large Text");

    expect(smallText).toHaveStyle({
      fontSize: "0.875rem",
    });
    expect(largeText).toHaveStyle({
      fontSize: "1.25rem",
    });
  });
});
