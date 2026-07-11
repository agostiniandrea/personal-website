import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useI18n } from "@lib/utils/i18n";
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
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid
    ${({ $scrolled, theme }) => ($scrolled ? `${theme.colors.highlight}30` : "transparent")};
  box-shadow: ${({ $scrolled }) => ($scrolled ? "0 2px 12px rgba(0, 0, 0, 0.06)" : "none")};
  left: 0;
  padding: ${({ theme }) => theme.space.md} 0;
  position: fixed;
  right: 0;
  top: 0;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
  z-index: 100;
`;

const Logo = styled(Link)`
  color: ${({ theme }) => theme.colors.headline};
  cursor: pointer;
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-decoration: none;
`;

const DesktopNav = styled.nav`
  align-items: center;
  display: none;
  gap: ${({ theme }) => theme.space["2xl"]};

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    display: flex;
  }
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  padding-bottom: 2px;
  position: relative;

  &::after {
    background: ${({ theme }) => theme.colors.highlight};
    bottom: -4px;
    content: '';
    height: 2px;
    left: 0;
    position: absolute;
    right: 0;
    transform: scaleX(${({ $active }) => ($active ? 1 : 0)});
    transform-origin: left;
    transition: transform 0.25s ease;
  }

  &:hover::after {
    transform: scaleX(1);
  }
`;

const IconButton = styled(Button)`
  align-items: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.headline};
  cursor: pointer;
  display: flex;
  justify-content: center;
  min-height: 44px;
  min-width: 44px;
  padding: ${({ theme }) => theme.space.sm};
`;

const HamburgerButton = styled(IconButton)`
  @media (min-width: ${BREAKPOINTS.xTablet}) {
    display: none;
  }
`;

const LocaleButton = styled(Button)`
  align-items: center;
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${({ theme }) => theme.radii.xs};
  color: ${({ theme }) => theme.colors.headline};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  justify-content: center;
  letter-spacing: 0.08em;
  min-height: 44px;
  min-width: 44px;
  padding: 0.25rem 0.625rem;
  text-transform: uppercase;
  transition: all 0.2s ease;

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
  overflow-y: auto;
  padding: ${({ theme }) => theme.space.xl};
`;

const DrawerLocaleButton = styled(LocaleButton)`
  align-self: flex-start;
  margin-bottom: 1.5rem;
  margin-left: 1.5rem;
  margin-top: auto;
`;

const SiteHeader: React.FC<SiteHeaderProps> = ({ logoText, navLinks }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = useI18n(router.locale);
  const nextLocale = router.locale === "en" ? "it" : "en";
  const nextLocaleName = router.locale === "it"
    ? (nextLocale === "en" ? "Inglese" : "Italiano")
    : (nextLocale === "it" ? "Italian" : "English");

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
            <DesktopNav aria-label={t.mainNavigation}>
              {navLinks.map((link) => (
                <NavLink key={link.url} href={link.url} $active={activeSection === link.url} onClick={(e) => handleAnchorClick(e, link.url)}>
                  {link.label}
                </NavLink>
              ))}
              <LocaleButton onClick={switchLocale} aria-label={t.switchToLocale(nextLocaleName)}>
                {nextLocale.toUpperCase()}
              </LocaleButton>
            </DesktopNav>
            <HamburgerButton
              ref={hamburgerRef}
              onClick={() => setIsOpen(true)}
              aria-label={t.openMenu}
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
            aria-label={t.navigationMenu}
          >
            <DrawerTopBar>
              <IconButton onClick={closeDrawer} aria-label={t.closeMenu}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </IconButton>
            </DrawerTopBar>
            <nav aria-label={t.mobileNavigation}>
              <DrawerLinks>
                {navLinks.map((link) => (
                  <Link key={link.url} href={link.url} onClick={(e) => { handleAnchorClick(e, link.url); closeDrawer(); }}>
                    {link.label}
                  </Link>
                ))}
              </DrawerLinks>
            </nav>
            <DrawerLocaleButton onClick={() => { closeDrawer(); switchLocale(); }} aria-label={t.switchToLocale(nextLocaleName)}>
              {nextLocale.toUpperCase()}
            </DrawerLocaleButton>
          </Drawer>
        </>
      )}
    </>
  );
};

export default SiteHeader;
