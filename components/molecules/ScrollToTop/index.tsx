import { useEffect, useState } from "react";
import styled from "styled-components";

const Button = styled.button<{ $visible: boolean }>`
  align-items: center;
  background: ${({ theme }) => theme.colors.button};
  border: none;
  border-radius: ${({ theme }) => theme.radii.full};
  bottom: ${({ theme }) => theme.space["2xl"]};
  color: ${({ theme }) => theme.colors.button_text};
  cursor: pointer;
  display: flex;
  height: 2.75rem;
  justify-content: center;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  position: fixed;
  right: ${({ theme }) => theme.space["2xl"]};
  transform: translateY(${({ $visible }) => ($visible ? "0" : "0.5rem")});
  transition: opacity 0.25s ease, transform 0.25s ease;
  width: 2.75rem;
  z-index: 100;

  &:hover {
    opacity: 0.85;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.headline};
    outline-offset: 3px;
  }

  svg {
    display: block;
  }
`;

const ScrollToTop: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const footer = document.querySelector("footer[role='contentinfo']");
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <Button
      $visible={scrolled && !footerVisible}
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 13V3M8 3L3 8M8 3l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Button>
  );
};

export default ScrollToTop;
