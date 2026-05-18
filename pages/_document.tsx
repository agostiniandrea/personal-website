import { colors } from "@config/customizations/colors";
import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html { background: ${colors.background}; }
              body { background: ${colors.background}; color: ${colors.main}; font-family: sans-serif; margin: 0; padding: 0; }
              a { color: inherit; text-decoration: none; }
              button { background: none; border: none; }
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
