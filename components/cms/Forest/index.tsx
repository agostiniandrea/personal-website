import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Container, Text } from "@components/ions";
import { BREAKPOINTS } from "@constants";
import { ForestModal } from "./ForestModal";

export interface ForestProps {
  sectionLabel?: string;
  heading?: string;
  subheading?: string;
  reviewCount?: number;
  treeCount?: number;
  improvementsCount?: number;
  ctaHeading?: string;
  ctaBody?: string;
  ctaButtonLabel?: string;
  seasonName?: string;
  seasonCurrent?: number;
  seasonTarget?: number;
}

function useAnimatedCounter(target: number, inView: boolean) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const duration = 1400;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return count;
}

const Section = styled.section`
  padding: 5rem 0;
  position: relative;
`;

const SectionLabel = styled(Text)`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.highlight};
  margin-bottom: 1.25rem;
`;

const SectionHeading = styled.h2`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.headline};
  margin: 0 0 1rem;
  max-width: 640px;
  line-height: ${({ theme }) => theme.lineHeights.tight};

  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  }
`;

const Subheading = styled(Text)`
  max-width: 580px;
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin-bottom: 3.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 3.5rem;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const StatNumber = styled.span`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: 2.75rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.headline};
  line-height: 1;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: 3.25rem;
  }
`;

const StatLabel = styled(Text)`
  color: ${({ theme }) => theme.colors.paragraph};
`;

const CtaCard = styled.div`
  border: 1px solid rgba(128, 128, 128, 0.15);
  border-radius: 1rem;
  padding: 2.5rem;
  margin-bottom: 2.5rem;
  background: ${({ theme }) => theme.colors.surface};

  @media (min-width: ${BREAKPOINTS.tablet}) {
    padding: 3rem;
  }
`;

const CtaHeading = styled.h3`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.headline};
  margin: 0 0 0.75rem;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  }
`;

const CtaBody = styled(Text)`
  margin-bottom: 1.75rem;
  max-width: 520px;
`;

const PlantButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: ${({ theme }) => theme.colors.button};
  color: ${({ theme }) => theme.colors.button_text};
  font-family: ${({ theme }) => theme.fontFamilies.default};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  border: 2px solid transparent;
  border-radius: ${({ theme }) => theme.radii.xs};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: transparent;
    border-color: ${({ theme }) => theme.colors.highlight};
    color: ${({ theme }) => theme.colors.highlight};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.headline};
    outline-offset: 3px;
  }
`;

const ProgressSection = styled.div`
  margin-bottom: 2rem;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.75rem;
`;

const ProgressLabel = styled(Text)`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.headline};
`;

const ProgressCount = styled(Text)`
  color: ${({ theme }) => theme.colors.paragraph};
`;

const ProgressTrack = styled.div`
  height: 4px;
  border-radius: 999px;
  background: rgba(128, 128, 128, 0.15);
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $pct: number; $animate: boolean }>`
  height: 100%;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.highlight};
  width: ${({ $animate, $pct }) => ($animate ? `${$pct}%` : "0%")};
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.3s;
`;

const TreeNationNote = styled(Text)`
  color: ${({ theme }) => theme.colors.paragraph};

  a {
    color: ${({ theme }) => theme.colors.highlight};
    text-decoration: underline;
    text-decoration-color: transparent;
    text-underline-offset: 3px;
    transition: text-decoration-color 0.2s ease;

    &:hover {
      text-decoration-color: ${({ theme }) => theme.colors.highlight};
    }
  }
`;

const Forest: React.FC<ForestProps> = ({
  sectionLabel = "🌳 Forest",
  heading = "This portfolio grows with your feedback.",
  subheading = "Every meaningful suggestion helps shape the next version. As a thank you, I dedicate a real tree.",
  reviewCount = 47,
  treeCount = 47,
  improvementsCount = 12,
  ctaHeading = "Help this portfolio grow.",
  ctaBody = "If you spot something off, find a broken link, or have a sharp suggestion — I want to hear it. The best feedback earns a tree in your name.",
  ctaButtonLabel = "🌱 Plant a leaf",
  seasonName = "Season One",
  seasonCurrent = 5,
  seasonTarget = 25,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const reviews = useAnimatedCounter(reviewCount, inView);
  const trees = useAnimatedCounter(treeCount, inView);
  const improvements = useAnimatedCounter(improvementsCount, inView);

  const pct = Math.min((seasonCurrent / seasonTarget) * 100, 100);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Section id="forest" ref={sectionRef as React.RefObject<HTMLElement>}>
        <Container>
          <SectionLabel>{sectionLabel}</SectionLabel>
          <SectionHeading>{heading}</SectionHeading>
          <Subheading variant="large">{subheading}</Subheading>

          <StatsGrid>
            <StatItem>
              <StatNumber>{reviews}</StatNumber>
              <StatLabel variant="small">reviews</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>{trees}</StatNumber>
              <StatLabel variant="small">trees dedicated</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>{improvements}</StatNumber>
              <StatLabel variant="small">improvements shipped</StatLabel>
            </StatItem>
          </StatsGrid>

          <CtaCard>
            <CtaHeading>{ctaHeading}</CtaHeading>
            <CtaBody>{ctaBody}</CtaBody>
            <PlantButton
              onClick={() => setModalOpen(true)}
              aria-haspopup="dialog"
            >
              {ctaButtonLabel}
            </PlantButton>
          </CtaCard>

          <ProgressSection>
            <ProgressHeader>
              <ProgressLabel variant="small">{seasonName}</ProgressLabel>
              <ProgressCount variant="small">
                {seasonCurrent} / {seasonTarget} trees
              </ProgressCount>
            </ProgressHeader>
            <ProgressTrack>
              <ProgressFill $pct={pct} $animate={inView} />
            </ProgressTrack>
          </ProgressSection>

          <TreeNationNote variant="small">
            Trees are dedicated through{" "}
            <a
              href="https://tree-nation.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Tree-Nation
            </a>
            . Each tree supports verified biodiversity and reforestation projects.
          </TreeNationNote>
        </Container>
      </Section>

      <ForestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default Forest;
