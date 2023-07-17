import { Head } from "@components/atoms";
import GlobalStyle from "@config/customizations/globalStyles";
import Theme from "@config/theme";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Theme>
      <GlobalStyle />
      <Head />
      <Component {...pageProps} />
    </Theme>
  );
}
