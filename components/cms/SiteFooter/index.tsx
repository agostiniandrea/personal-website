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
}

const FooterWrapper = styled.footer`
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: ${toSpacing("2xl")};
  padding-bottom: ${toSpacing("2xl")};
`;

const SocialLink = styled(Link)`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.highlight};
`;

const CarbonBadgeWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: ${toSpacing("lg")};
  padding-bottom: ${toSpacing("lg")};
`;

const CURRENT_YEAR = new Date().getFullYear();

const SiteFooter: React.FC<SiteFooterProps> = ({ socialLinks, copyrightName }) => (
  <FooterWrapper role="contentinfo">
    <Container>
      <Flex gap="xl" justifyContent="center" wrap="wrap">
        {socialLinks.map((link) => (
          <SocialLink key={link.url} href={link.url} isExternal ariaLabel={link.label}>
            {link.label}
          </SocialLink>
        ))}
      </Flex>
      <CarbonBadgeWrapper>
        <CarbonBadge />
      </CarbonBadgeWrapper>
      <Text variant="small" style={{ textAlign: "center" }}>
        © {CURRENT_YEAR} {copyrightName}
      </Text>
    </Container>
  </FooterWrapper>
);

export default SiteFooter;
