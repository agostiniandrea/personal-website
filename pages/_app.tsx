import { Head } from "@components/atoms";
import { ScrollToTop } from "@components/molecules";
import GlobalStyle from "@config/customizations/globalStyles";
import theme from "@config/theme";
import type { AppProps } from "next/app";
import { Inter, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "styled-components";
import styled from "styled-components";
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: false,
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

  &:focus-visible {
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
        <ScrollToTop />
        {process.env.NEXT_PUBLIC_VERCEL_ENV && <SpeedInsights />}
        {process.env.NEXT_PUBLIC_VERCEL_ENV && <Analytics />}
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}</Script>
          </>
        )}
      </ThemeProvider>
    </div>
  );
}
