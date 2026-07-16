import { GetStaticPropsResult } from "next";
import NextHead from "next/head";

import { createClient } from "@supabase/supabase-js";

import { Seo } from "@components/atoms";
import { SiteFooter,SiteHeader } from "@components/cms";
import { ModuleRenderer, SectionDots } from "@components/organisms";
import { MODULES,PAGE_TYPES } from "@constants";
import {
  getPageContent,
  getSiteFooterContent,
  getSiteHeaderContent,
  TPageFields,
  TSiteFooterData,
  TSiteHeaderData,
} from "@lib/utils/cms";

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

    const [{ count: feedbackCount }, { data: plantedRows }, { count: improvementsCount }] =
      await Promise.all([
        supabase.from("feedback").select("id", { count: "exact", head: true }),
        supabase.from("feedback").select("trees_planted"),
        supabase.from("feedback").select("id", { count: "exact", head: true }).eq("status", "implemented"),
      ]);

    // Trees are counted only once actually purchased (trees_planted is set at
    // purchase time), never inferred from feedback statuses
    const treesDedicatedCount = (plantedRows ?? []).reduce(
      (sum, row) => sum + (row.trees_planted ?? 0),
      0
    );

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

const JOB_TITLE: Record<string, string> = {
  en: "Senior Frontend Developer & Tech Lead",
  it: "Senior Frontend Developer e Tech Lead",
};

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
        <ModuleRenderer components={page.modules} pageOrigin={PAGE_TYPES.HOME} />
      </main>
      <SiteFooter {...(footer ?? { socialLinks: [], copyrightName: "Andrea Agostini" })} />
    </>
  );
}
