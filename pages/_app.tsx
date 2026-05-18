import { Head } from "@components/atoms";
import GlobalStyle from "@config/customizations/globalStyles";
import theme from "@config/theme";
import type { AppProps } from "next/app";
import { Inter, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "styled-components";
import styled from "styled-components";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const SkipLink = styled.a`
  position: absolute;
  top: -100%;
  left: 0;
  padding: 0.75rem 1.25rem;
  background: ${({ theme }) => theme.colors.button};
  color: ${({ theme }) => theme.colors.button_text};
  font-weight: bold;
  font-size: 1rem;
  z-index: 9999;
  text-decoration: none;

  &:focus {
    top: 0;
  }
`;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${inter.variable} ${spaceGrotesk.variable}`} style={{ display: "contents" }}>
      <ThemeProvider theme={theme}>
        <SkipLink href="#main-content">Skip to main content</SkipLink>
        <GlobalStyle />
        <Head />
        <Component {...pageProps} />
        <SpeedInsights />
        <Analytics />
      </ThemeProvider>
    </div>
  );
}
