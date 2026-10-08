import styled from "styled-components";

import { Container, Flex, Link, Text } from "@components/ions";
import { CarbonBadge, TreeNationLabel } from "@components/molecules";
import { toSpacing } from "@config/tokens";
import { BREAKPOINTS, BREAKPOINTS_BELOW } from "@constants";
import { trackContactInteraction } from "@lib/utils/analytics";

export interface SiteFooterLink {
  label: string;
  url: string;
}

export interface SiteFooterProps {
  socialLinks: SiteFooterLink[];
  copyrightName: string;
  tagline?: string | null;
  ctaHeading?: string | null;
}

const FooterWrapper = styled.footer`
  background: ${({ theme }) => theme.colors.badgeBg};
  border-top: 1px solid rgba(128, 128, 128, 0.12);
  padding-bottom: ${toSpacing("xl")};
  padding-top: ${toSpacing("3xl")};

  /* Hidden on mobile: the app-style tab bar makes a per-page footer redundant,
     so its contact/social/carbon/copyright content moves into the More sheet. */
  @media (max-width: ${BREAKPOINTS_BELOW.xTablet}) {
    display: none;
  }
`;

/* ── Primary CTA layer ── */

const CtaArea = styled.div`
  border-bottom: 1px solid rgba(128, 128, 128, 0.12);
  margin-bottom: ${toSpacing("2xl")};
  padding-bottom: ${toSpacing("2xl")};
  text-align: center;

  @media (max-width: ${BREAKPOINTS_BELOW.xTablet}) {
    margin-bottom: ${toSpacing("lg")};
    padding-bottom: ${toSpacing("lg")};
  }

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    border-bottom: none;
  }
`;

const CtaHeading = styled.h2`
  color: ${({ theme }) => theme.colors.headline};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: ${({ theme }) => theme.lineHeights.tight};
  margin: 0 0 ${toSpacing("xl")};

  @media (max-width: ${BREAKPOINTS_BELOW.xTablet}) {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    margin-bottom: ${toSpacing("lg")};
  }

  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  }
`;

const SocialLink = styled(Link)`
  color: ${({ theme }) => theme.colors.highlight};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

/* ── Secondary subfooter layer ── */

const Subfooter = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${toSpacing("lg")};
  text-align: center;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    align-items: flex-end;
    display: grid;
    gap: ${toSpacing("xl")};
    grid-template-columns: 1fr 1fr 1fr;
    text-align: left;
  }
`;

/* The left side of the footer is the site's environmental footprint: Website
   Carbon (how light the site is) with the Climate Action Website label under
   it (what the site gives back). */
const BadgeCol = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${toSpacing("sm")};
  justify-content: center;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    align-items: flex-start;
  }
`;

/* Both Tree-Nation labels are credentials, not calls to action: dimmed like the
   carbon badge and back to full strength on hover/focus, where the official
   widgets show their own hover state and link. Only the wrapper is styled; the
   widgets themselves are untouched. */
const Credential = styled(TreeNationLabel)`
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover,
  &:focus-within {
    opacity: 1;
  }
`;

/* Secondary to Website Carbon: the same 0.9 scale the carbon badge gets. */
const ClimateActionCredential = styled(Credential)`
  transform: scale(0.9);
  transform-origin: left top;
`;

const TaglineCol = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${toSpacing("md")};

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    align-items: center;
    text-align: center;
  }
`;

const Tagline = styled(Text)`
  color: ${({ theme }) => theme.colors.paragraph};
  max-width: 36ch;
`;

/* Each CMS line is its own block, so `balance` can even out its wrap instead of
   dropping a single word onto a line of its own. */
const TaglineLine = styled.span`
  display: block;
  text-wrap: balance;
`;

const CarbonWrapper = styled.div`
  opacity: 0.7;
  transform: scale(0.9);
  transform-origin: center center;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    transform-origin: left center;
  }
`;

const MetaCol = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${toSpacing("md")};

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    align-items: flex-end;
  }
`;

const CURRENT_YEAR = new Date().getFullYear();

const SiteFooter: React.FC<SiteFooterProps> = ({
  socialLinks,
  copyrightName,
  tagline,
  ctaHeading = "Let's work together.",
}) => (
  <FooterWrapper role="contentinfo">
    <Container>
      {/* Primary CTA */}
      <CtaArea>
        {ctaHeading && <CtaHeading>{ctaHeading}</CtaHeading>}
        <Flex gap="xl" justifyContent="center" wrap="wrap">
          {socialLinks.map((link) => (
            <SocialLink
              key={link.url}
              href={link.url}
              isExternal={!link.url.startsWith("mailto:")}
              ariaLabel={link.label}
              onClick={() => trackContactInteraction(link.url, "footer")}
            >
              {link.label}
            </SocialLink>
          ))}
        </Flex>
      </CtaArea>

      {/* Subfooter */}
      <Subfooter>
        <BadgeCol>
          <CarbonWrapper>
            <CarbonBadge />
          </CarbonWrapper>
          <ClimateActionCredential type="offset-website" />
        </BadgeCol>

        <TaglineCol>
          {tagline && (
            <Tagline variant="small">
              {tagline.split("\n").map((line, i) => (
                <TaglineLine key={i}>{line}</TaglineLine>
              ))}
            </Tagline>
          )}
        </TaglineCol>

        <MetaCol>
          <Credential type="tree-counter" />
          <Text variant="small" style={{ color: "var(--color-paragraph)" }}>
            © {CURRENT_YEAR} {copyrightName}
          </Text>
        </MetaCol>
      </Subfooter>
    </Container>
  </FooterWrapper>
);

export default SiteFooter;
