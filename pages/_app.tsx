import { useEffect, useState } from "react";

import type { AppProps } from "next/app";
import { Inter, Space_Grotesk } from "next/font/google";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import styled from "styled-components";
import { ThemeProvider } from "styled-components";

import { Head } from "@components/atoms";
import {
  AnalyticsScripts,
  CookieBanner,
  ScrollToTop,
} from "@components/molecules";
import GlobalStyle from "@config/customizations/globalStyles";
import theme from "@config/theme";
import { useI18n } from "@lib/utils/i18n";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

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
  background: ${({ theme }) => theme.colors.button};
  color: ${({ theme }) => theme.colors.button_text};
  font-size: 1rem;
  font-weight: bold;
  left: 0;
  padding: 0.75rem 1.25rem;
  position: absolute;
  text-decoration: none;
  top: -100%;
  z-index: 9999;

  &:focus-visible {
    top: 0;
  }
`;

export default function App({ Component, pageProps, router }: AppProps) {
  const [gaConsent, setGaConsent] = useState(false);
  const t = useI18n(router.locale);

  useEffect(() => {
    if (localStorage.getItem("cookie-consent") === "accepted") {
      setGaConsent(true);
    }
    const handler = () => setGaConsent(true);
    window.addEventListener("cookie-consent-accepted", handler);
    return () => window.removeEventListener("cookie-consent-accepted", handler);
  }, []);

  return (
    <div
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      style={{ display: "contents" }}
    >
      <ThemeProvider theme={theme}>
        <SkipLink href="#main-content">{t.skipToMainContent}</SkipLink>
        <GlobalStyle />
        <Head />
        <Component {...pageProps} />
        <ScrollToTop />
        <CookieBanner />
        {process.env.NEXT_PUBLIC_VERCEL_ENV && <SpeedInsights />}
        {process.env.NEXT_PUBLIC_VERCEL_ENV && <Analytics />}
        <AnalyticsScripts
          gaId={GA_ID}
          clarityId={CLARITY_ID}
          hasConsent={gaConsent}
        />
      </ThemeProvider>
    </div>
  );
}
