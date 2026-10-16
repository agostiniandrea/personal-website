import styled from "styled-components";

import BrandLogo from "@components/atoms/BrandLogo";
import { Container, Flex, Link, Text } from "@components/ions";
import {
  GreenWebBadge,
  LeafIcon,
  TreeNationLabel,
} from "@components/molecules";
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
     so its contact/social/badges/copyright content moves into the More sheet. */
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

  /* With no rule between the two halves, the old 2rem + 2rem read as one big
     hole: the links and the badges below are one footer, so they sit closer. */
  @media (min-width: ${BREAKPOINTS.xTablet}) {
    border-bottom: none;
    margin-bottom: ${toSpacing("xl")};
    padding-bottom: 0;
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

/* One hairline for the separators of the sections below the contact links. */
const SEPARATOR = "1px solid rgba(128, 128, 128, 0.12)";

/* ── Sustainability ── */

const SustainabilityRow = styled.div`
  align-items: center;
  border-bottom: ${SEPARATOR};
  border-top: ${SEPARATOR};
  display: flex;
  flex-direction: column;
  gap: ${toSpacing("lg")};
  margin-bottom: ${toSpacing("lg")};
  padding-bottom: ${toSpacing("lg")};
  padding-top: ${toSpacing("lg")};
  text-align: center;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
`;

const SustainabilityIntro = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${toSpacing("sm")};

  @media (min-width: ${BREAKPOINTS.tablet}) {
    align-items: flex-start;
    flex: 1 1 0;
  }
`;

const SustainabilityLabel = styled.p`
  align-items: center;
  color: ${({ theme }) => theme.colors.highlight};
  display: inline-flex;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  gap: ${toSpacing("xs")};
  letter-spacing: 0.12em;
  margin: 0;
  text-transform: uppercase;
`;

/* The credentials sit in one row and wrap, never overflow. Each keeps its own
   natural size and aspect ratio (the Tree-Nation label is drawn by their
   script, Green Web is a fixed 200 × 95 image), so nothing is stretched or
   cropped; they are only centred in the row. */
const BadgesRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${toSpacing("lg")} ${toSpacing("xl")};
  justify-content: center;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    flex: 0 1 auto;
    justify-content: flex-end;
  }
`;

/* The Climate Action label is a credential, shown at full strength: dimmed, it
   reads as switched off next to the teal. Only the wrapper is styled; the
   widget itself is untouched. */
const ClimateActionCredential = styled(TreeNationLabel)`
  align-items: center;
  display: flex;
`;

/* ── Bottom row ── */

const BottomRow = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${toSpacing("md")};
  text-align: center;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
`;

const Tagline = styled(Text)`
  color: ${({ theme }) => theme.colors.paragraph};
`;

/* The CMS lines run on as one sentence, with no width cap: they take the room
   the row has and only wrap when it runs out. */
const TaglineLine = styled.span`
  &:not(:last-child)::after {
    content: " ";
  }
`;

const MetaCol = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${toSpacing("sm")};
`;

/* Decorative here: the copyright line already names the owner. */
const FooterLogo = styled(BrandLogo)`
  display: block;
  height: 2rem;
  width: auto;
`;

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

      {/* Sustainability */}
      <SustainabilityRow>
        <SustainabilityIntro>
          <SustainabilityLabel>
            <LeafIcon size={16} />
            Sustainable by design
          </SustainabilityLabel>
          <Text variant="small" style={{ color: "var(--color-paragraph)" }}>
            This website runs on renewable energy and supports global
            reforestation.
          </Text>
        </SustainabilityIntro>

        <BadgesRow>
          <ClimateActionCredential type="offset-website" />
          <GreenWebBadge />
        </BadgesRow>
      </SustainabilityRow>

      {/* Bottom row */}
      <BottomRow>
        {tagline && (
          <Tagline variant="small">
            {tagline.split("\n").map((line, i) => (
              <TaglineLine key={i}>{line}</TaglineLine>
            ))}
          </Tagline>
        )}

        <MetaCol>
          <span aria-hidden="true">
            <FooterLogo label={copyrightName} variant="symbol" />
          </span>
          <Text variant="small" style={{ color: "var(--color-paragraph)" }}>
            © {new Date().getFullYear()} {copyrightName}
          </Text>
        </MetaCol>
      </BottomRow>
    </Container>
  </FooterWrapper>
);

export default SiteFooter;
