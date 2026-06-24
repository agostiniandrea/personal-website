import styled from "styled-components";
import { toSpacing } from "@config/tokens";
import { Container, Flex, Link, Text } from "@components/ions";
import { CarbonBadge } from "@components/molecules";
import { BREAKPOINTS } from "@constants";

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
  padding-top: ${toSpacing("4xl")};
  padding-bottom: ${toSpacing("md")};
`;

/* ── Primary CTA layer ── */

const CtaArea = styled.div`
  text-align: center;
  margin-bottom: ${toSpacing("2xl")};
  padding-bottom: ${toSpacing("2xl")};
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const CtaHeading = styled.h2`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.headline};
  margin: 0 0 ${toSpacing("xl")};
  line-height: ${({ theme }) => theme.lineHeights.tight};

  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  }
`;

const SocialLink = styled(Link)`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.highlight};
`;

/* ── Secondary subfooter layer ── */

const Subfooter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${toSpacing("lg")};
  text-align: center;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    align-items: flex-end;
    text-align: left;
    gap: ${toSpacing("xl")};
  }
`;

const BadgeCol = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    justify-content: flex-start;
  }
`;

const TaglineCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${toSpacing("sm")};
  flex-shrink: 0;

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
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
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
