import { fireEvent, screen } from "@testing-library/react";

import { THEME_STORAGE_KEY } from "@lib/utils/theme";
import { renderWithTheme } from "@test-utils/renderWithTheme";

import ThemeMenu from "../index";

const openMenu = () => {
  fireEvent.click(screen.getByRole("button", { expanded: false }));
};

describe("ThemeMenu", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    window.localStorage.clear();
  });

  it("starts closed, on system, with the choice named in the trigger", () => {
    renderWithTheme(<ThemeMenu />);
    const trigger = screen.getByRole("button", { name: "Colour theme: System" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("names the choice the pre-hydration script already applied", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    renderWithTheme(<ThemeMenu />);
    expect(
      screen.getByRole("button", { name: "Colour theme: Dark" }),
    ).toBeInTheDocument();
  });

  it("opens a menu with the three choices", () => {
    renderWithTheme(<ThemeMenu />);
    openMenu();
    expect(screen.getByRole("menu", { name: "Colour theme" })).toBeInTheDocument();
    expect(screen.getAllByRole("menuitemradio")).toHaveLength(3);
    expect(screen.getByRole("menuitemradio", { name: "System" })).toBeChecked();
  });

  it("applies and stores an explicit choice, then closes", () => {
    renderWithTheme(<ThemeMenu />);
    openMenu();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Light" }));

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Colour theme: Light" }),
    ).toHaveFocus();
  });

  /* The whole design rests on this: system is the absence of the attribute, so
     the prefers-color-scheme media query decides again. */
  it("hands the palette back to the OS when system is picked", () => {
    document.documentElement.setAttribute("data-theme", "light");
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    renderWithTheme(<ThemeMenu />);
    openMenu();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "System" }));

    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it("closes on Escape and gives focus back to the trigger", () => {
    renderWithTheme(<ThemeMenu />);
    openMenu();
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Colour theme: System" }),
    ).toHaveFocus();
  });

  it("closes when the pointer goes down outside it", () => {
    renderWithTheme(<ThemeMenu />);
    openMenu();
    expect(screen.getByRole("menu")).toBeInTheDocument();

    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("leaves the palette alone while the menu is merely open", () => {
    renderWithTheme(<ThemeMenu />);
    openMenu();
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });
});
