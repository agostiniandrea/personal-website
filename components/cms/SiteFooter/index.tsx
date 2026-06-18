import styled from "styled-components";
import { toSpacing } from "@config/tokens";
import { Container, Flex, Link, Text } from "@components/ions";
import { CarbonBadge } from "@components/molecules";

export interface SiteFooterLink {
  label: string;
  url: string;
}

export interface SiteFooterProps {
  socialLinks: SiteFooterLink[];
  copyrightName: string;
  tagline?: string | null;
}

const FooterWrapper = styled.footer`
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: ${toSpacing("3xl")};
  padding-bottom: ${toSpacing("2xl")};
`;

const Inner = styled(Flex)`
  flex-direction: column;
  align-items: center;
  gap: ${toSpacing("xl")};
`;

const SocialLink = styled(Link)`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.highlight};
`;

const Tagline = styled(Text)`
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.paragraph};
`;

const CarbonBadgeRow = styled.div`
  display: flex;
  justify-content: center;
`;

const CURRENT_YEAR = new Date().getFullYear();

const SiteFooter: React.FC<SiteFooterProps> = ({ socialLinks, copyrightName, tagline }) => (
  <FooterWrapper role="contentinfo">
    <Container>
      <Inner>
        <Flex gap="xl" justifyContent="center" wrap="wrap">
          {socialLinks.map((link) => (
            <SocialLink key={link.url} href={link.url} isExternal={!link.url.startsWith("mailto:")} ariaLabel={link.label}>
              {link.label}
            </SocialLink>
          ))}
        </Flex>
        {tagline && <Tagline>{tagline}</Tagline>}
        <CarbonBadgeRow>
          <CarbonBadge />
        </CarbonBadgeRow>
        <Text variant="small" style={{ textAlign: "center" }}>
          © {CURRENT_YEAR} {copyrightName}
        </Text>
      </Inner>
    </Container>
  </FooterWrapper>
);

export default SiteFooter;
