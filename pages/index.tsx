import NextHead from "next/head";
import { createClient } from "@supabase/supabase-js";
import { Seo } from "@components/atoms";
import { SiteHeader, SiteFooter } from "@components/cms";
import { ModuleRenderer, SectionDots } from "@components/organisms";
import {
  TPageFields,
  TSiteHeaderData,
  TSiteFooterData,
  getPageContent,
  getSiteHeaderContent,
  getSiteFooterContent,
} from "@lib/utils/cms";
import { PAGE_TYPES, MODULES } from "@constants";
import { GetStaticPropsResult } from "next";

type THomepage = {
  page: TPageFields;
  header: TSiteHeaderData | null;
  footer: TSiteFooterData | null;
  locale: string;
};

export async function getStaticProps({ locale = "en" }: { locale?: string }): Promise<
  GetStaticPropsResult<THomepage>
> {
  const [page, header, footer] = await Promise.all([
    getPageContent(PAGE_TYPES.HOME, "", locale),
    getSiteHeaderContent(locale),
    getSiteFooterContent(locale),
  ]);

  if (!page) {
    return {
      notFound: true,
    };
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const [{ count: feedbackCount }, { count: treesDedicatedCount }, { count: improvementsCount }] =
      await Promise.all([
        supabase.from("feedback").select("id", { count: "exact", head: true }),
        supabase.from("feedback").select("id", { count: "exact", head: true }).in("status", ["accepted", "implemented"]),
        supabase.from("feedback").select("id", { count: "exact", head: true }).eq("status", "implemented"),
      ]);

    const forestModule = page.modules.find((m) => m.type === MODULES.FOREST);
    if (forestModule) {
      forestModule.fields = {
        ...forestModule.fields,
        feedbackCount: feedbackCount ?? 0,
        treesDedicatedCount: treesDedicatedCount ?? 0,
        improvementsCount: improvementsCount ?? 0,
      };
    }
  } catch (err) {
    console.error("Failed to fetch forest stats from Supabase:", err);
  }

  return {
    props: {
      page,
      header,
      footer,
      locale,
    },
    revalidate: 86400,
  };
}

// Italian SEO fallbacks — applied when Contentful's Italian locale fields are not yet translated.
// Once the pageLanding entry's seoTitle/seoDescription have been set in Contentful under the
// Italian locale, these constants can be removed.
const IT_SEO_FALLBACKS = {
  seoTitle: "Andrea Agostini · Senior Frontend Developer e Tech Lead",
  seoDescription:
    "Senior Frontend Developer e Tech Lead con oltre 10 anni di esperienza in ecommerce headless e design system con React, Next.js, TypeScript e Shopify. Da Bangkok, full remote.",
  ogImageAlt: "Foto di Andrea Agostini — Senior Frontend Developer e Tech Lead",
} as const;

const JOB_TITLE: Record<string, string> = {
  en: "Senior Frontend Developer & Tech Lead",
  it: "Senior Frontend Developer e Tech Lead",
};

export default function Home({ page, header, footer, locale }: THomepage) {
  const isItalian = locale === "it";

  const seoTitle = isItalian ? IT_SEO_FALLBACKS.seoTitle : page.seoTitle;
  const seoDescription = isItalian ? IT_SEO_FALLBACKS.seoDescription : page.seoDescription;
  const ogImageAlt = isItalian ? IT_SEO_FALLBACKS.ogImageAlt : undefined;

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Andrea Agostini",
    jobTitle: JOB_TITLE[locale] ?? JOB_TITLE.en,
    url: "https://agostiniandrea.dev",
    email: "a.agostini92@gmail.com",
    sameAs: [
      "https://linkedin.com/in/agostiniandrea",
      "https://github.com/agostiniandrea",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bangkok",
      addressCountry: "TH",
    },
  };

  return (
    <>
      <NextHead>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </NextHead>
      <Seo
        locale={locale}
        ogImageAlt={ogImageAlt}
        path="/"
        seoDescription={seoDescription}
        seoTitle={seoTitle}
      />
      {header && <SiteHeader {...header} />}
      <SectionDots />
      <main id="main-content">
        <ModuleRenderer components={page.modules} pageOrigin={PAGE_TYPES.HOME} />
      </main>
      <SiteFooter {...(footer ?? { socialLinks: [], copyrightName: "Andrea Agostini" })} />
    </>
  );
}
