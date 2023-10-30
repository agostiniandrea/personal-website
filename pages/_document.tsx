import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      {(process.env.NODE_ENV === "development" ||
        process.env.VERCEL_ENV === "preview") && (
        // eslint-disable-next-line @next/next/no-sync-scripts
        <Script
          data-project-id={process.env.METICULOUS_ACCESS_TOKEN}
          data-is-production-environment="false"
          src="https://snippet.meticulous.ai/v1/meticulous.js"
        />
      )}
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
