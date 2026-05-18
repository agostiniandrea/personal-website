import { useState, useEffect, useRef } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
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

const Logo = styled(NextLink)`
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
  align-items: center;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    display: flex;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  min-width: 44px;
  min-height: 44px;
  color: ${({ theme }) => theme.colors.headline};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HamburgerButton = styled(IconButton)`
  @media (min-width: ${BREAKPOINTS.xTablet}) {
    display: none;
  }
`;

const LocaleButton = styled.button`
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  padding: 0.25rem 0.625rem;
  min-width: 44px;
  min-height: 44px;
  font-size: 0.75rem;
  font-weight: bold;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.headline};
  border-radius: ${({ theme }) => theme.radii.xs};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.4);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 3px;
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

const Drawer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 280px;
  background: ${({ theme }) => theme.colors.background};
  z-index: 300;
  display: flex;
  flex-direction: column;
  transform: translateX(${({ $isOpen }) => ($isOpen ? "0" : "100%")});
  transition: transform 0.3s ease;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.8);
`;

const DrawerTopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
`;

const DrawerLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  overflow-y: auto;
`;

const DrawerLocaleButton = styled(LocaleButton)`
  margin-top: auto;
  margin-left: 1.5rem;
  margin-bottom: 1.5rem;
  align-self: flex-start;
`;

const SiteHeader: React.FC<SiteHeaderProps> = ({ logoText, navLinks }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const nextLocale = router.locale === "en" ? "it" : "en";

  const switchLocale = () => {
    router.push({ pathname: router.pathname, query: router.query }, router.asPath, {
      locale: nextLocale,
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;

    const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDrawer();
        return;
      }
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const closeDrawer = () => {
    setIsOpen(false);
    hamburgerRef.current?.focus();
  };

  return (
    <>
      <Header>
        <Container>
          <Flex justifyContent="space-between" alignItems="center">
            <Logo href="/">{logoText}</Logo>
            <DesktopNav aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link key={link.url} href={link.url}>
                  {link.label}
                </Link>
              ))}
              <LocaleButton onClick={switchLocale} aria-label={`Switch to ${nextLocale === "it" ? "Italian" : "English"}`}>
                {nextLocale.toUpperCase()}
              </LocaleButton>
            </DesktopNav>
            <HamburgerButton
              ref={hamburgerRef}
              onClick={() => setIsOpen(true)}
              aria-label="Open menu"
              aria-expanded={isOpen}
              aria-controls="mobile-nav"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
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
          <Overlay $isOpen={isOpen} onClick={closeDrawer} role="presentation" />
          <Drawer
            ref={drawerRef}
            id="mobile-nav"
            $isOpen={isOpen}
            aria-label="Navigation menu"
            role="dialog"
            aria-modal="true"
          >
            <DrawerTopBar>
              <IconButton onClick={closeDrawer} aria-label="Close menu">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </IconButton>
            </DrawerTopBar>
            <nav aria-label="Mobile navigation">
              <DrawerLinks>
                {navLinks.map((link) => (
                  <Link key={link.url} href={link.url} onClick={closeDrawer}>
                    {link.label}
                  </Link>
                ))}
              </DrawerLinks>
            </nav>
            <DrawerLocaleButton onClick={switchLocale} aria-label={`Switch to ${nextLocale === "it" ? "Italian" : "English"}`}>
              {nextLocale.toUpperCase()}
            </DrawerLocaleButton>
          </Drawer>
        </>
      )}
    </>
  );
};

export default SiteHeader;
