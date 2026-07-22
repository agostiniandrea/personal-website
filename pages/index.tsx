import { GetStaticPropsResult } from "next";
import NextHead from "next/head";

import { createClient } from "@supabase/supabase-js";

import { Seo } from "@components/atoms";
import { SiteFooter, SiteHeader } from "@components/cms";
import { FeedbackNudge } from "@components/molecules";
import { MobileNav, ModuleRenderer, SectionDots } from "@components/organisms";
import { MODULES, PAGE_TYPES } from "@constants";
import {
  getPageContent,
  getSiteFooterContent,
  getSiteHeaderContent,
  TPageFields,
  TSiteFooterData,
  TSiteHeaderData,
} from "@lib/utils/cms";
import { getForestImpactStats } from "@lib/utils/forestStats";
import { getForestTreeCount } from "@lib/utils/treeNation";

type THomepage = {
  page: TPageFields;
  header: TSiteHeaderData | null;
  footer: TSiteFooterData | null;
  locale: string;
};

export async function getStaticProps({
  locale = "en",
}: {
  locale?: string;
}): Promise<GetStaticPropsResult<THomepage>> {
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
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error(
        "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is unavailable during static generation",
      );
    }
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    const [impactStats, liveTreeCount] = await Promise.all([
      getForestImpactStats(supabase),
      getForestTreeCount(supabase),
    ]);

    const forestModule = page.modules.find((m) => m.type === MODULES.FOREST);
    if (forestModule) {
      forestModule.fields = {
        ...forestModule.fields,
        ...impactStats,
        // Verified Tree-Nation total wins; the Contentful treeCount stays as
        // the fallback when no sync has ever succeeded
        ...(liveTreeCount !== null && { treeCount: liveTreeCount }),
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
    revalidate: 3600,
  };
}

const JOB_TITLE: Record<string, string> = {
  en: "Senior Frontend Developer & Tech Lead",
  it: "Senior Frontend Developer e Tech Lead",
};

/* The CV asset reaches the hero through cleanProps as a plain URL, but the
   raw page modules may still carry the Contentful asset shape */
function extractCvUrl(page: TPageFields): string | undefined {
  const hero = page.modules.find((m) => m.type === MODULES.HERO_PORTFOLIO);
  const file = hero?.fields?.cvDownloadFile as
    | string
    | { fields?: { file?: { url?: string } } }
    | undefined;
  if (!file) return undefined;
  if (typeof file === "string") return file;
  const url = file.fields?.file?.url;
  return url ? (url.startsWith("//") ? `https:${url}` : url) : undefined;
}

export default function Home({ page, header, footer, locale }: THomepage) {
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
        path="/"
        seoDescription={page.seoDescription}
        seoTitle={page.seoTitle}
      />
      {header && <SiteHeader {...header} />}
      <SectionDots />
      <main id="main-content">
        <ModuleRenderer
          components={page.modules}
          pageOrigin={PAGE_TYPES.HOME}
        />
      </main>
      <SiteFooter
        {...(footer ?? { socialLinks: [], copyrightName: "Andrea Agostini" })}
      />
      <FeedbackNudge />
      <MobileNav cvDownloadUrl={extractCvUrl(page)} />
    </>
  );
}
