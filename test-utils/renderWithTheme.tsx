import * as React from "react";
import { act } from "react";

import { render, RenderResult } from "@testing-library/react";
import { ThemeProvider } from "styled-components";

import theme from "../config/theme";

export type RenderWithThemeOptions = {
  theme?: typeof theme;
};

export const renderWithTheme = (
  ui: React.ReactElement,
  { theme: customTheme }: RenderWithThemeOptions = {},
): RenderResult => {
  let renderer: RenderResult;

  act(() => {
    renderer = render(
      <ThemeProvider theme={customTheme || theme}>{ui}</ThemeProvider>,
    );
  });

  return {
    ...renderer!,
    rerender: (newUi: React.ReactNode) => {
      let newRenderer: RenderResult;

      act(() => {
        newRenderer = render(
          <ThemeProvider theme={customTheme || theme}>{newUi}</ThemeProvider>,
          {
            container: renderer!.container,
          },
        );
      });

      return newRenderer!;
    },
  };
};
