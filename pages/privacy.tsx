import { GetStaticPropsResult } from "next";
import { useRouter } from "next/router";

import styled from "styled-components";

import { Seo } from "@components/atoms";
import { SiteFooter, SiteHeader } from "@components/cms";
import { Box, Heading, Text } from "@components/ions";
import { Section } from "@components/molecules";
import { MobileNav } from "@components/organisms";
import { BREAKPOINTS, getPrivacyPolicy } from "@constants";
import {
  getSiteFooterContent,
  getSiteHeaderContent,
  TSiteFooterData,
  TSiteHeaderData,
} from "@lib/utils/cms";
import { clearConsent } from "@lib/utils/consent";

type TPrivacy = {
  header: TSiteHeaderData | null;
  footer: TSiteFooterData | null;
};

const PageLayout = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
`;

/* The page is one Section, so its eyebrow, title and vertical rhythm are the
   ones every other section uses. Below the desktop breakpoint the footer is
   hidden and the fixed tab bar takes its place, so the page clears the bar at
   the bottom; the header offset and that clearance are the same two paddings
   html[data-mobile-view] main applies once the bar has mounted, so nothing
   jumps on hydration. */
const Wrapper = styled(Box).attrs({ as: "main" })`
  flex: 1;
  padding: var(--site-header-height) 0
    calc(var(--mobile-nav-height) + env(safe-area-inset-bottom));

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    padding: var(--site-header-height) 0 0;
  }
`;

/* A reading column: long legal text is easier to follow at about 70 characters
   a line than across the full width of the site. */
const Article = styled.div`
  max-width: 46rem;
`;

const Updated = styled(Text)`
  margin: 0 0 1.5rem;
`;

const Intro = styled(Text)`
  line-height: ${({ theme }) => theme.lineHeights.loose};
  margin: 0 0 ${({ theme }) => theme.space["3xl"]};
`;

const PolicySection = styled.section`
  border-top: 1px solid rgba(128, 128, 128, 0.18);
  padding: 2rem 0 0;

  & + & {
    margin-top: 2rem;
  }
`;

const SectionHeading = styled(Heading).attrs({ size: "card", as: "h2" })`
  margin: 0 0 1rem;
  scroll-margin-top: 5rem;
`;

const Paragraph = styled(Text)`
  line-height: ${({ theme }) => theme.lineHeights.loose};

  & + & {
    margin-top: 1rem;
  }
`;

const List = styled.ul`
  color: ${({ theme }) => theme.colors.paragraph};
  display: flex;
  flex-direction: column;
  font-size: ${({ theme }) => theme.fontSizes.md};
  gap: 0.75rem;
  line-height: ${({ theme }) => theme.lineHeights.loose};
  margin: 0;
  padding-left: 1.25rem;

  &:not(:first-child) {
    margin-top: 1rem;
  }

  &:not(:last-child) {
    margin-bottom: 1rem;
  }
`;

const ItemLabel = styled.strong`
  color: ${({ theme }) => theme.colors.headline};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const ChoiceButton = styled.button`
  background: ${({ theme }) => theme.colors.button};
  border: none;
  border-radius: ${({ theme }) => theme.radii.xs};
  color: ${({ theme }) => theme.colors.button_text};
  cursor: pointer;
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-top: 1.25rem;
  padding: ${({ theme }) => theme.space.md} 1.25rem;
  transition: opacity 0.2s ease;

  @media (hover: hover) {
    &:hover {
      opacity: 0.8;
    }
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.button};
    outline-offset: 2px;
  }
`;

export async function getStaticProps({
  locale = "en",
}: {
  locale?: string;
}): Promise<GetStaticPropsResult<TPrivacy>> {
  const [header, footer] = await Promise.all([
    getSiteHeaderContent(locale),
    getSiteFooterContent(locale),
  ]);

  return {
    props: { header, footer },
    revalidate: 3600,
  };
}

export default function Privacy({ header, footer }: TPrivacy) {
  const { locale } = useRouter();
  const policy = getPrivacyPolicy(locale);

  /* Forget the stored choice and reload: with no choice on record, the banner
     asks again and the analytics scripts stay off until the visitor answers.
     If the browser blocks storage there is nothing to forget, so do not
     reload into the same state. */
  const changeChoice = () => {
    if (clearConsent()) window.location.reload();
  };

  return (
    <PageLayout>
      <Seo
        seoTitle={policy.seoTitle}
        seoDescription={policy.seoDescription}
        locale={locale}
        path="/privacy"
      />
      {header && <SiteHeader {...header} />}
      <Wrapper id="main-content">
        <Section eyebrow="Privacy" heading={policy.title} headingAs="h1">
          <Article>
            <Updated variant="small">
              {policy.updatedLabel}: {policy.updated}
            </Updated>
            <Intro variant="large">{policy.intro}</Intro>

            {policy.sections.map(
              ({ id, heading, paragraphs, items, closing }) => (
                <PolicySection key={id} aria-labelledby={`privacy-${id}`}>
                  <SectionHeading id={`privacy-${id}`}>
                    {heading}
                  </SectionHeading>
                  {paragraphs?.map((text) => (
                    <Paragraph key={text}>{text}</Paragraph>
                  ))}
                  {items && (
                    <List>
                      {items.map(({ label, text }) => (
                        <li key={text}>
                          {label && <ItemLabel>{label} </ItemLabel>}
                          {text}
                        </li>
                      ))}
                    </List>
                  )}
                  {closing?.map((text) => (
                    <Paragraph key={text}>{text}</Paragraph>
                  ))}
                </PolicySection>
              ),
            )}

            <PolicySection aria-labelledby="privacy-cookie-choice">
              <SectionHeading id="privacy-cookie-choice">
                {policy.cookieChoice.heading}
              </SectionHeading>
              <Paragraph>{policy.cookieChoice.body}</Paragraph>
              <ChoiceButton type="button" onClick={changeChoice}>
                {policy.cookieChoice.button}
              </ChoiceButton>
            </PolicySection>
          </Article>
        </Section>
      </Wrapper>
      <SiteFooter
        {...(footer ?? { socialLinks: [], copyrightName: "Andrea Agostini" })}
      />
      <MobileNav standalone socialLinks={footer?.socialLinks ?? []} />
    </PageLayout>
  );
}
