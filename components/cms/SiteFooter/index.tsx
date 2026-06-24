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
  padding-top: ${toSpacing("3xl")};
  padding-bottom: ${toSpacing("2xl")};
`;

const CtaArea = styled.div`
  text-align: center;
  margin-bottom: ${toSpacing("3xl")};
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

const Tagline = styled(Text)`
  text-align: center;
  color: ${({ theme }) => theme.colors.paragraph};
`;

const BottomBar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${toSpacing("sm")};
  text-align: center;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
`;

const SocialLink = styled(Link)`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.highlight};
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
      <Flex justifyContent="center" styles="margin-bottom: 1rem;">
        <CarbonBadge />
      </Flex>
      <BottomBar>
        {tagline && <Tagline variant="small">{tagline}</Tagline>}
        <Text variant="small">© {CURRENT_YEAR} {copyrightName}</Text>
      </BottomBar>
    </Container>
  </FooterWrapper>
);

export default SiteFooter;
