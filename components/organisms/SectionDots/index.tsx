import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { BREAKPOINTS } from "@constants";

const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "journey", label: "Journey" },
  { id: "experience", label: "Experience" },
  { id: "sustainability", label: "Sustainability" },
  { id: "beyond-code", label: "Beyond Code" },
];

const Nav = styled.nav`
  position: fixed;
  right: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  display: none;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.875rem;
  }
`;

const DotRow = styled.li`
  position: relative;
  display: flex;
  align-items: center;
  list-style: none;

  &:hover span {
    opacity: 1;
    transform: translateX(0);
  }
`;

const Label = styled.span`
  position: absolute;
  right: calc(100% + 0.5rem);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.highlight};
  opacity: 0;
  transform: translateX(6px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  white-space: nowrap;
  pointer-events: none;
`;

const Dot = styled.button<{ $active: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.highlight};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.highlight : "transparent"};
  cursor: pointer;
  padding: 0;
  transition: background 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.highlight};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 3px;
  }
`;

const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;


export default function SectionDots() {
  const [active, setActive] = useState("hero");
  const observerRef = useRef<IntersectionObserver | null>(null);

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

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const activeLabel = SECTIONS.find((s) => s.id === active)?.label ?? "";

  return (
    <>
      <Nav aria-label="Section navigation">
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {SECTIONS.map(({ id, label }) => (
            <DotRow key={id}>
              <Label>{label}</Label>
              <Dot
                $active={active === id}
                onClick={() => scrollTo(id)}
                aria-label={`Go to ${label}`}
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
