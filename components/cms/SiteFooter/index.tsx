import styled from "styled-components";

import { Container, Flex, Link, Text } from "@components/ions";
import { CarbonBadge } from "@components/molecules";
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

  /* Slim footer on mobile: the bottom tab bar already handles section
     navigation, so the footer keeps only its unique content (contact CTA,
     socials, carbon badge) at a tighter vertical rhythm. */
  @media (max-width: ${BREAKPOINTS_BELOW.xTablet}) {
    padding-top: ${toSpacing("xl")};
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

const BadgeCol = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    justify-content: flex-start;
  }
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
  gap: ${toSpacing("sm")};

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
        </BadgeCol>

        <TaglineCol>
          {tagline && (
            <Tagline variant="small">
              {tagline.split("\n").map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </Tagline>
          )}
        </TaglineCol>

        <MetaCol>
          <Text variant="small" style={{ color: "var(--color-paragraph)" }}>
            © {CURRENT_YEAR} {copyrightName}
          </Text>
        </MetaCol>
      </Subfooter>
    </Container>
  </FooterWrapper>
);

export default SiteFooter;
