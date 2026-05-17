import styled from "styled-components";
import { Container, Flex, Link } from "@components/ions";
import { BREAKPOINTS } from "@constants";

export interface SiteHeaderLink {
  label: string;
  url: string;
}

export interface SiteHeaderProps {
  logoText: string;
  navLinks: SiteHeaderLink[];
}

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.75rem 0;
`;

const Logo = styled.a`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: 1.25rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.headline};
  cursor: pointer;
  text-decoration: none;
`;

const Nav = styled.nav`
  display: none;
  gap: 2rem;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    display: flex;
  }
`;

const SiteHeader: React.FC<SiteHeaderProps> = ({ logoText, navLinks }) => (
  <Header>
    <Container>
      <Flex justifyContent="space-between" alignItems="center">
        <Logo href="/">{logoText}</Logo>
        <Nav>
          {navLinks.map((link) => (
            <Link key={link.url} href={link.url}>
              {link.label}
            </Link>
          ))}
        </Nav>
      </Flex>
    </Container>
  </Header>
);

export default SiteHeader;
