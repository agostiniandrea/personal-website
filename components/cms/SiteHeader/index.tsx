import { useState, useEffect } from "react";
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

const DesktopNav = styled.nav`
  display: none;
  gap: 2rem;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    display: flex;
  }
`;

const HamburgerButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: ${({ theme }) => theme.colors.headline};
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    display: none;
  }
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  pointer-events: ${({ $isOpen }) => ($isOpen ? "all" : "none")};
  transition: opacity 0.3s ease;
`;

const Drawer = styled.nav<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 280px;
  background: ${({ theme }) => theme.colors.background};
  z-index: 300;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transform: translateX(${({ $isOpen }) => ($isOpen ? "0" : "100%")});
  transition: transform 0.3s ease;
`;

const DrawerHeader = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: ${({ theme }) => theme.colors.headline};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DrawerLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SiteHeader: React.FC<SiteHeaderProps> = ({ logoText, navLinks }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <Header>
        <Container>
          <Flex justifyContent="space-between" alignItems="center">
            <Logo href="/">{logoText}</Logo>
            <DesktopNav>
              {navLinks.map((link) => (
                <Link key={link.url} href={link.url}>
                  {link.label}
                </Link>
              ))}
            </DesktopNav>
            <HamburgerButton
              onClick={() => setIsOpen(true)}
              aria-label="Open menu"
              aria-expanded={isOpen}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </HamburgerButton>
          </Flex>
        </Container>
      </Header>
      {mounted && (
        <>
          <Overlay $isOpen={isOpen} onClick={() => setIsOpen(false)} aria-hidden="true" />
          <Drawer $isOpen={isOpen} aria-label="Site navigation">
            <DrawerHeader>
              <CloseButton onClick={() => setIsOpen(false)} aria-label="Close menu">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </CloseButton>
            </DrawerHeader>
            <DrawerLinks>
              {navLinks.map((link) => (
                <Link key={link.url} href={link.url} onClick={() => setIsOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </DrawerLinks>
          </Drawer>
        </>
      )}
    </>
  );
};

export default SiteHeader;
