import { screen, fireEvent } from "@testing-library/react";
import Button from "../index";
import { renderWithTheme } from "@test-utils/renderWithTheme";

describe("Button", () => {
  it("renders button with default styles", () => {
    renderWithTheme(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveStyle({
      background: "#3b82f6",
      color: "#ffffff",
    });
  });

  it("renders button with custom styles", () => {
    renderWithTheme(
      <Button style={{ background: "#b8c1ec" }}>Custom Button</Button>,
    );

    const button = screen.getByRole("button", { name: "Custom Button" });
    expect(button).toHaveStyle({
      background: "#b8c1ec",
    });
  });

  it("handles click events", () => {
    const handleClick = jest.fn();
    renderWithTheme(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button", { name: "Click me" });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders button as disabled", () => {
    renderWithTheme(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole("button", { name: "Disabled Button" });
    expect(button).toBeDisabled();
  });
});
