import { Head } from "@components/atoms";
import GlobalStyle from "@config/customizations/globalStyles";
import theme from "@config/theme";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "styled-components";

export default function App({ Component, pageProps }: AppProps) {
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
