import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/router";

import styled from "styled-components";

import { BREAKPOINTS } from "@constants";
import { SECTION_LABELS,useI18n } from "@lib/utils/i18n";

const SECTION_IDS = [
  "hero",
  "about",
  "projects",
  "skills",
  "journey",
  "experience",
  "sustainability",
  "beyond-code",
  "forest",
] as const;

const Nav = styled.nav`
  display: none;
  position: fixed;
  right: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    align-items: flex-end;
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }
`;

const DotRow = styled.li`
  align-items: center;
  display: flex;
  list-style: none;
  position: relative;

  @media (hover: hover) {
    &:hover span {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const Label = styled.span`
  color: ${({ theme }) => theme.colors.highlight};
  font-size: 0.6875rem;
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  letter-spacing: 0.08em;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  right: calc(100% + 0.5rem);
  text-transform: uppercase;
  transform: translateX(6px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  white-space: nowrap;
`;

const Dot = styled.button<{ $active: boolean }>`
  background: ${({ $active, theme }) =>
    $active ? theme.colors.highlight : "transparent"};
  border: 2px solid ${({ theme }) => theme.colors.highlight};
  border-radius: ${({ theme }) => theme.radii.rounded};
  cursor: pointer;
  flex-shrink: 0;
  height: 10px;
  padding: 0;
  transition: background 0.2s ease;
  width: 10px;

  @media (hover: hover) {
    &:hover {
      background: ${({ theme }) => theme.colors.highlight};
    }
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 3px;
  }
`;

const VisuallyHidden = styled.span`
  border: 0;
  clip: rect(0, 0, 0, 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;


export default function SectionDots() {
  const [active, setActive] = useState("hero");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { locale } = useRouter();
  const t = useI18n(locale);
  const localeKey = locale === "it" ? "it" : "en";
  const sections = SECTION_IDS.map((id) => ({
    id,
    label: SECTION_LABELS[id]?.[localeKey] ?? id,
  }));

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const activeLabel = sections.find((s) => s.id === active)?.label ?? "";

  return (
    <>
      <Nav aria-label={t.sectionNavigation}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {sections.map(({ id, label }) => (
            <DotRow key={id}>
              <Label>{label}</Label>
              <Dot
                $active={active === id}
                onClick={() => scrollTo(id)}
                aria-label={t.goTo(label)}
                aria-current={active === id ? "true" : undefined}
              />
            </DotRow>
          ))}
        </ul>
      </Nav>
      <VisuallyHidden aria-live="polite" aria-atomic="true">
        {activeLabel}
      </VisuallyHidden>
    </>
  );
}
