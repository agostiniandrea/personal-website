import { Head } from "@components/atoms";
import GlobalStyle from "@config/customizations/globalStyles";
import theme from "@config/theme";
import type { AppProps } from "next/app";
import { Inter, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "styled-components";

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

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${inter.variable} ${spaceGrotesk.variable}`} style={{ display: "contents" }}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Head />
        <Component {...pageProps} />
        <SpeedInsights />
        <Analytics />
      </ThemeProvider>
    </div>
  );
}
