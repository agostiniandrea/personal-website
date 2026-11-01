import React, { useEffect } from "react";

import type { Preview } from "@storybook/nextjs";
import { useDarkMode } from "storybook-dark-mode";
import { ThemeProvider } from "styled-components";
import { createGlobalStyle } from "styled-components";

import GlobalStyle from "../config/customizations/globalStyles";
import theme from "../config/theme";

const StorybookGlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background: var(--color-background);
    transition: background 0.2s ease, color 0.2s ease;
  }
`;

// Mock window.matchMedia for useMedia hook
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => {
    const isDesktop = query.includes("(min-width: 1200px)");
    const isMobile = query.includes("(max-width: 600px)");
    const isTablet = query.includes(
      "(min-width: 600px) and (max-width: 1200px)",
    );
    const isTouch = query.includes("(pointer:coarse)");

    return {
      matches: isDesktop || (!isMobile && !isTablet && !isTouch),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    };
  },
});

// Syncs the storybook-dark-mode toggle → data-theme on <html>
// All CSS custom properties in globalStyles.ts react to [data-theme]
const ThemeSync: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDark = useDarkMode();

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
  }, [isDark]);

  return <>{children}</>;
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    darkMode: {
      dark: { appBg: "#0f1b19", appContentBg: "#0f1b19", barBg: "#162623" },
      light: { appBg: "#faf8f3", appContentBg: "#faf8f3", barBg: "#ffffff" },
      stylePreview: true,
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <ThemeSync>
          <StorybookGlobalStyle />
          <GlobalStyle />
          <Story />
        </ThemeSync>
      </ThemeProvider>
    ),
  ],
};

export default preview;
