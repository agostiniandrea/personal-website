import React from 'react';
import type { Preview } from '@storybook/react';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from '../config/customizations/globalStyles';
import theme from '../config/theme'
import { createGlobalStyle } from 'styled-components';

const StorybookGlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Rainier', sans-serif;
  }
`;

// Mock window.matchMedia for useMedia hook
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => {
    const isDesktop = query.includes('(min-width: 1200px)');
    const isMobile = query.includes('(max-width: 600px)');
    const isTablet = query.includes('(min-width: 600px) and (max-width: 1200px)');
    const isTouch = query.includes('(pointer:coarse)');

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

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <StorybookGlobalStyle />
        <GlobalStyle />
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview; 