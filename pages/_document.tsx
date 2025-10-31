import { colors } from "@config/customizations/colors";
import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preload critical fonts for better performance */}
        <link
          rel="preload"
          href="/assets/fonts/Rainier/RainierNorth500.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Prevent FOUC - Flash of Unstyled Content */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html { 
                background: ${colors.background}; 
              }
              body { 
                background: ${colors.background}; 
                font-family: "Rainier", sans-serif;
                margin: 0;
                padding: 0;
              }
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
