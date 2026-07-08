import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import { Button, Container, Flex, Link } from "@components/ions";
import { Drawer, DrawerTopBar, Overlay } from "@components/molecules";
import { BREAKPOINTS } from "@constants";

export interface SiteHeaderLink {
  label: string;
  url: string;
}

export interface SiteHeaderProps {
  logoText: string;
  navLinks: SiteHeaderLink[];
}

// Sections not in the nav that still count toward a nav link's active state
const SECTION_TO_NAV: Record<string, string> = {};

const Header = styled.header<{ $scrolled: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 100;
  padding: 0.75rem 0;
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.highlight}30;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
`;

const Logo = styled(Link)`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.headline};
  cursor: pointer;
  text-decoration: none;
`;

const DesktopNav = styled.nav`
  display: none;
  gap: ${({ theme }) => theme.space["2xl"]};
  align-items: center;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    display: flex;
  }
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  position: relative;
  padding-bottom: 2px;

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ theme }) => theme.colors.highlight};
    transform: scaleX(${({ $active }) => ($active ? 1 : 0)});
    transform-origin: left;
    transition: transform 0.25s ease;
  }

  &:hover::after {
    transform: scaleX(1);
  }
`;

const IconButton = styled(Button)`
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

const LocaleButton = styled(Button)`
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  padding: 0.25rem 0.625rem;
  min-width: 44px;
  min-height: 44px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
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

const DrawerLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xl};
  padding: ${({ theme }) => theme.space.xl};
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
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const nextLocale = router.locale === "en" ? "it" : "en";

  const switchLocale = () => {
    router.push(router.asPath, router.asPath, { locale: nextLocale, scroll: false });
  };

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    const id = href.slice(1);
    if (router.pathname !== "/") {
      router.push("/").then(() => {
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const anchorIds = [
      ...navLinks
        .filter((l) => l.url.startsWith("#"))
        .map((l) => l.url.slice(1)),
      ...Object.keys(SECTION_TO_NAV),
    ];

    const getActive = () => {
      const threshold = window.innerHeight * 0.45;
      let active = "";
      for (const id of anchorIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= threshold) {
          active = SECTION_TO_NAV[id] ?? `#${id}`;
        }
      }
      return active;
    };

    const onScroll = () => setActiveSection(getActive());
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [navLinks]);

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
      <Header $scrolled={scrolled}>
        <Container>
          <Flex justifyContent="space-between" alignItems="center">
            <Logo href="/">{logoText}</Logo>
            <DesktopNav aria-label="Main navigation">
              {navLinks.map((link) => (
                <NavLink key={link.url} href={link.url} $active={activeSection === link.url} onClick={(e) => handleAnchorClick(e, link.url)}>
                  {link.label}
                </NavLink>
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
          <Overlay isOpen={isOpen} onClick={closeDrawer} />
          <Drawer
            ref={drawerRef}
            id="mobile-nav"
            isOpen={isOpen}
            aria-label="Navigation menu"
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
                  <Link key={link.url} href={link.url} onClick={(e) => { handleAnchorClick(e, link.url); closeDrawer(); }}>
                    {link.label}
                  </Link>
                ))}
              </DrawerLinks>
            </nav>
            <DrawerLocaleButton onClick={() => { closeDrawer(); switchLocale(); }} aria-label={`Switch to ${nextLocale === "it" ? "Italian" : "English"}`}>
              {nextLocale.toUpperCase()}
            </DrawerLocaleButton>
          </Drawer>
        </>
      )}
    </>
  );
};

export default SiteHeader;
