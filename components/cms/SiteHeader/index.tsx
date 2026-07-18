import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import styled from "styled-components";

import { Button, Container, Flex, Link } from "@components/ions";
import { BREAKPOINTS } from "@constants";
import { useI18n } from "@lib/utils/i18n";

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

  @media (hover: hover) {
    &:hover::after {
      transform: scaleX(1);
    }
  }
`;

const LocaleButton = styled(Button)`
  align-items: center;
  background: none;
  border: 1px solid
    color-mix(in srgb, ${({ theme }) => theme.colors.headline} 20%, transparent);
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

  @media (hover: hover) {
    &:hover {
      background: color-mix(
        in srgb,
        ${({ theme }) => theme.colors.headline} 5%,
        transparent
      );
      border-color: color-mix(
        in srgb,
        ${({ theme }) => theme.colors.headline} 40%,
        transparent
      );
    }
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 3px;
  }
`;

const SiteHeader: React.FC<SiteHeaderProps> = ({ logoText, navLinks }) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const router = useRouter();
  const t = useI18n(router.locale);
  const nextLocale = router.locale === "en" ? "it" : "en";
  const nextLocaleName = router.locale === "it" ? "Inglese" : "Italian";

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




  return (
    <>
      <Header $scrolled={scrolled}>
        <Container>
          <Flex justifyContent="space-between" alignItems="center">
            <Logo href="/">{logoText}</Logo>
            <Flex alignItems="center" gap="lg">
              <DesktopNav aria-label={t.mainNavigation}>
                {navLinks.map((link) => (
                  <NavLink key={link.url} href={link.url} $active={activeSection === link.url} onClick={(e) => handleAnchorClick(e, link.url)}>
                    {link.label}
                  </NavLink>
                ))}
              </DesktopNav>
              {/* Visible at every width: mobile navigation lives in the bottom
                  tab bar, but the language switch stays in the header */}
              <LocaleButton onClick={switchLocale} aria-label={t.switchToLocale(nextLocaleName)}>
                {nextLocale.toUpperCase()}
              </LocaleButton>
            </Flex>
          </Flex>
        </Container>
      </Header>
    </>
  );
};

export default SiteHeader;
