import { Head } from "@components/atoms";
import GlobalStyle from "@config/customizations/globalStyles";
import theme from "@config/theme";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "styled-components";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Ensure font is loaded and prevent flash during resize
    if (typeof window !== "undefined" && "fonts" in document) {
      const font = new FontFace(
        "Rainier",
        'url("/assets/fonts/Rainier/RainierNorth500.woff2") format("woff2")'
      );
      
      font.load().then(() => {
        document.fonts.add(font);
        document.body.classList.add("font-loaded");
      }).catch(() => {
        // Fallback if font loading fails
        document.body.classList.add("font-loaded");
      });
    } else {
      // Fallback for browsers without Font Loading API
      document.body.classList.add("font-loaded");
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Head />
      <Component {...pageProps} />
      <SpeedInsights />
      <Analytics />
    </ThemeProvider>
  );
}
