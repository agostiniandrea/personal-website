import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import Header from "../index";
import theme from "../../../../config/theme";

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe("Header", () => {
  it("renders header with default styles", () => {
    renderWithTheme(<Header />);

    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
    expect(header).toHaveStyle({
      background: theme.colors.background,
    });
  });

  it("renders header with custom styles", () => {
    const customStyles = {
      boxShadow: "0px -3px 0px 0px #000000 inset",
    };

    renderWithTheme(<Header styles={customStyles} />);

    const header = screen.getByRole("banner");
    expect(header).toHaveStyle(customStyles);
  });

  it("renders header with navigation", () => {
    renderWithTheme(<Header />);

    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
  });
});
