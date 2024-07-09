/* eslint-disable @next/next/no-sync-scripts */
import configSEO from "@config/seo.json";
import { DefaultSeo } from "next-seo";
import NextHead from "next/head";

/**
 * Component for rendering the head section of the document.
 * This component includes the default SEO configuration and meta tags.
 */
const Head = () => {
  return (
    <>
      <DefaultSeo {...configSEO} />
      <NextHead>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/site.webmanifest" key="site-manifest" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png"></link>
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="theme-color" content="#ffffff" />
      </NextHead>
    </>
  );
};

export default Head;
