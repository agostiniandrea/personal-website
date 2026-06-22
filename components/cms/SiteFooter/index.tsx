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
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: ${toSpacing("4xl")};
  padding-bottom: ${toSpacing("2xl")};
`;

const CtaArea = styled.div`
  text-align: center;
  margin-bottom: ${toSpacing("3xl")};
  padding-bottom: ${toSpacing("3xl")};
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

const Tagline = styled(Text)`
  text-align: center;
  color: ${({ theme }) => theme.colors.paragraph};
`;

const MetaArea = styled(Flex)`
  flex-direction: column;
  align-items: center;
  gap: ${toSpacing("xl")};
`;

const SocialLink = styled(Link)`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.highlight};
`;

const CarbonBadgeRow = styled.div`
  display: flex;
  justify-content: center;
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
      <CtaArea>
        <CtaHeading>{ctaHeading}</CtaHeading>
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
      <MetaArea>
        {tagline && <Tagline variant="small">{tagline}</Tagline>}
        <CarbonBadgeRow>
          <CarbonBadge />
        </CarbonBadgeRow>
        <Text variant="small" style={{ textAlign: "center" }}>
          © {CURRENT_YEAR} {copyrightName}
        </Text>
      </MetaArea>
    </Container>
  </FooterWrapper>
);

export default SiteFooter;
