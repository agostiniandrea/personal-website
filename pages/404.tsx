import { GetStaticPropsResult } from "next";
import { useRouter } from "next/router";

import styled from "styled-components";

import { Seo } from "@components/atoms";
import { SiteFooter, SiteHeader } from "@components/cms";
import { Box, Container, Heading, Link, Text } from "@components/ions";
import { BREAKPOINTS } from "@constants";
import {
  getSiteFooterContent,
  getSiteHeaderContent,
  TSiteFooterData,
  TSiteHeaderData,
} from "@lib/utils/cms";

type T404 = {
  header: TSiteHeaderData | null;
  footer: TSiteFooterData | null;
};

const PageLayout = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
`;

const Wrapper = styled(Box).attrs({ as: "main" })`
  padding: calc(3.5rem + 2.5rem) 0 2.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    padding: 3.5rem 0 0;
  }
`;

const Label = styled(Text)`
  color: ${({ theme }) => theme.colors.highlight};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.2em;
  margin: 0 0 1.25rem;
  text-transform: uppercase;
`;

const PageHeading = styled(Heading).attrs({ size: "display", as: "h1" })`
  margin: 0 0 1.5rem;
`;

const Body = styled(Text)`
  line-height: ${({ theme }) => theme.lineHeights.loose};
  margin: 0 0 ${({ theme }) => theme.space["3xl"]};
  max-width: 480px;
`;

const Layout = styled.div`
  align-items: center;
  display: grid;
  gap: 3rem;
  grid-template-columns: minmax(0, 1fr);

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    gap: 4rem;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  }
`;

/* A signpost for someone who took a wrong turn: a pole with one arrow per
   section, each a little crooked like hand-nailed boards. Pure CSS, so it adds
   no image or script to the page. */
const Signpost = styled.ul`
  --pole: 0.5rem;

  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  list-style: none;
  margin: 0 auto;
  max-width: 24rem;
  padding: 1.5rem 0 2.5rem;
  position: relative;
  width: 100%;

  /* the pole */
  &::before {
    background: ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.full};
    bottom: 0;
    content: "";
    left: calc(50% - var(--pole) / 2);
    position: absolute;
    top: 0;
    width: var(--pole);
  }

  /* the ground */
  &::after {
    background: ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.full};
    bottom: 0;
    content: "";
    height: 0.25rem;
    left: 12%;
    position: absolute;
    right: 12%;
  }
`;

const SignSlot = styled.li<{
  $direction: "left" | "right";
  $tilt: number;
  $shift: number;
}>`
  display: flex;
  justify-content: center;
  position: relative;
  transform: translateX(${({ $shift }) => $shift}%)
    rotate(${({ $tilt }) => $tilt}deg);
  transition: transform 0.25s ease;

  @media (hover: hover) {
    &:hover,
    &:focus-within {
      transform: translateX(
          calc(
            ${({ $shift }) => $shift}% +
              ${({ $direction }) =>
                $direction === "right" ? "0.75rem" : "-0.75rem"}
          )
        )
        rotate(${({ $tilt }) => $tilt}deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Sign = styled(Link)<{ $direction: "left" | "right" }>`
  background: ${({ theme }) => theme.colors.highlight};
  color: ${({ theme }) => theme.colors.background};
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  letter-spacing: 0.02em;
  min-width: 70%;
  text-align: ${({ $direction }) => ($direction === "right" ? "right" : "left")};
  transition: background 0.2s ease;
  ${({ $direction }) =>
    $direction === "right"
      ? `
        clip-path: polygon(0 0, calc(100% - 1.25rem) 0, 100% 50%, calc(100% - 1.25rem) 100%, 0 100%);
        padding: 0.75rem 2.25rem 0.75rem 1.25rem;`
      : `
        clip-path: polygon(1.25rem 0, 100% 0, 100% 100%, 1.25rem 100%, 0 50%);
        padding: 0.75rem 1.25rem 0.75rem 2.25rem;`}

  @media (hover: hover) {
    &:hover {
      background: ${({ theme }) => theme.colors.tertiary};
      color: ${({ theme }) => theme.colors.background};
    }
  }

  &:focus-visible {
    outline-offset: -4px;
  }
`;

/* Per-board nudge and tilt, so the signs look nailed up by hand. */
const SIGN_LAYOUT = [
  { shift: -6, tilt: -2.5 },
  { shift: 8, tilt: 2 },
  { shift: -3, tilt: -1.5 },
  { shift: 6, tilt: 3 },
  { shift: -8, tilt: -3 },
  { shift: 4, tilt: 1.5 },
];

/* Same sections as the header, so someone who mistyped a URL can jump straight
   to the right part of the one-page site. */
const copy = {
  en: {
    title: "Wrong turn.",
    body: "This page doesn't exist — but that's fine. I've made wrong turns before. They usually lead somewhere interesting.",
    prompt: "Looking for something? Try one of these:",
    back: "← Back home",
    backLabel: "Back to homepage",
    destinations: [
      { label: "Projects", id: "projects" },
      { label: "Skills", id: "skills" },
      { label: "Experience", id: "experience" },
      { label: "Journey", id: "journey" },
      { label: "Forest", id: "forest" },
      { label: "Contact", id: "contact" },
    ],
  },
  it: {
    title: "Strada sbagliata.",
    body: "Questa pagina non esiste, ma va bene così. Anch'io ho sbagliato strada, e di solito porta da qualche parte di interessante.",
    prompt: "Cerchi qualcosa? Prova da qui:",
    back: "← Torna alla home",
    backLabel: "Torna alla homepage",
    destinations: [
      { label: "Progetti", id: "projects" },
      { label: "Competenze", id: "skills" },
      { label: "Esperienza", id: "experience" },
      { label: "Percorso", id: "journey" },
      { label: "Foresta", id: "forest" },
      { label: "Contatti", id: "contact" },
    ],
  },
};

export async function getStaticProps({
  locale = "en",
}: {
  locale?: string;
}): Promise<GetStaticPropsResult<T404>> {
  const [header, footer] = await Promise.all([
    getSiteHeaderContent(locale),
    getSiteFooterContent(locale),
  ]);

  return {
    props: { header, footer },
    revalidate: 3600,
  };
}

export default function NotFound({ header, footer }: T404) {
  const { locale } = useRouter();
  const t = locale === "it" ? copy.it : copy.en;
  /* English is the default locale and lives at `/`, never `/en`. Next's own
     locale handling adds `/en` on this page, so the prefix is spelled out here
     and Next is told to leave the links alone (`locale={false}`). */
  const home = locale === "it" ? "/it" : "/";

  return (
    <PageLayout>
      <Seo
        seoTitle="404 — Page not found"
        seoDescription="This page doesn't exist — but the rest of the site does."
      />
      {header && <SiteHeader {...header} />}
      <Wrapper id="main-content">
        <Container>
          <Layout>
            <div>
              <Label>404</Label>
              <PageHeading>{t.title}</PageHeading>
              <Body variant="large">{t.body}</Body>
              <Link href={home} locale={false} ariaLabel={t.backLabel}>
                {t.back}
              </Link>
            </div>
            <nav aria-label={t.prompt}>
              <Signpost>
                {t.destinations.map(({ label, id }, index) => {
                  const direction = index % 2 === 0 ? "left" : "right";
                  const { shift, tilt } =
                    SIGN_LAYOUT[index % SIGN_LAYOUT.length];

                  return (
                    <SignSlot
                      key={id}
                      $direction={direction}
                      $shift={shift}
                      $tilt={tilt}
                    >
                      <Sign
                        href={`${home}#${id}`}
                        locale={false}
                        $direction={direction}
                      >
                        {label}
                      </Sign>
                    </SignSlot>
                  );
                })}
              </Signpost>
            </nav>
          </Layout>
        </Container>
      </Wrapper>
      <SiteFooter
        {...(footer ?? { socialLinks: [], copyrightName: "Andrea Agostini" })}
      />
    </PageLayout>
  );
}
