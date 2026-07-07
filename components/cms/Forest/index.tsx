import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Container, Text } from "@components/ions";
import { BREAKPOINTS } from "@constants";
import { ForestModal } from "./ForestModal";

export interface ChangelogItem {
  date: string;
  description: string;
}

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
  changelogItems?: ChangelogItem[];
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

function relativeTime(dateStr: string): string {
  const days = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 86_400_000
  );
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

/* ── Layout ── */

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

/* ── Stats ── */

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
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
  border: 1px solid rgba(128, 128, 128, 0.15);
  border-radius: 0.875rem;
  padding: 1.25rem 1.5rem;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    border: none;
    border-radius: 0;
    padding: 0;
  }
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

/* ── CTA card — forced dark ── */

const CtaCard = styled.div`
  border-radius: 1rem;
  padding: 2rem 2rem;
  margin-bottom: 2.5rem;
  background: #0a0a0f;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    padding: 2.5rem 3rem;
  }
`;

const CtaHeading = styled.h3`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: #ffffff;
  margin: 0 0 0.625rem;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  }
`;

const CtaBody = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: rgba(255, 255, 255, 0.6);
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin: 0 0 1.75rem;
  max-width: 480px;
`;

const PlantButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: ${({ theme }) => theme.colors.button};
  color: #ffffff;
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
    outline: 2px solid #ffffff;
    outline-offset: 3px;
  }
`;

/* ── Progress ── */

const ProgressSection = styled.div`
  margin-bottom: 0.75rem;
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
  margin-bottom: 0.5rem;
`;

const ProgressFill = styled.div<{ $pct: number; $animate: boolean }>`
  height: 100%;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.highlight};
  width: ${({ $animate, $pct }) => ($animate ? `${$pct}%` : "0%")};
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.3s;
`;

const ProgressSublabel = styled(Text)`
  color: ${({ theme }) => theme.colors.paragraph};
`;

/* ── Tree-Nation note ── */

const TreeNationNote = styled(Text)`
  color: ${({ theme }) => theme.colors.paragraph};
  margin-bottom: 3rem;

  a {
    color: ${({ theme }) => theme.colors.highlight};
    text-decoration: none;
    transition: opacity 0.2s ease;

    &:hover { opacity: 0.75; }
  }
`;

/* ── Timeline ── */

const TimelineSection = styled.div``;

const TimelineHeading = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.paragraph};
  margin: 0 0 0;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const TimelineList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const TimelineItem = styled.li`
  display: flex;
  align-items: baseline;
  gap: 1.25rem;
  padding: 0.875rem 0;
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);

  &:first-child {
    border-top: 1px solid rgba(128, 128, 128, 0.1);
  }
`;

const TimelineDate = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.paragraph};
  white-space: nowrap;
  min-width: 88px;
  flex-shrink: 0;
`;

const TimelineText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.headline};
  line-height: ${({ theme }) => theme.lineHeights.normal};
`;

/* ── Divider between progress and timeline ── */

const Divider = styled.div`
  height: 1px;
  background: rgba(128, 128, 128, 0.1);
  margin: 2.5rem 0;
`;

/* ── Component ── */

const DEFAULT_CHANGELOG: ChangelogItem[] = [
  { date: "2026-07-07", description: "Forest section launched" },
  { date: "2026-07-07", description: "Storybook dark/light theme toggle" },
  { date: "2026-07-05", description: "Hero image load time optimized" },
  { date: "2026-07-04", description: "Footer divider visibility fixed" },
  { date: "2026-06-30", description: "Scroll hint arrow repositioned" },
];

const Forest: React.FC<ForestProps> = ({
  sectionLabel = "🌳 Forest",
  heading = "This portfolio grows with your feedback.",
  subheading = "Every meaningful suggestion helps shape the next version. As a thank you, I dedicate a real tree.",
  reviewCount = 47,
  treeCount = 47,
  improvementsCount = 12,
  ctaHeading = "Help this portfolio grow.",
  ctaBody = "If you spot something, leave a leaf.",
  ctaButtonLabel = "🌱 Plant a leaf",
  seasonName = "Season One",
  seasonCurrent = 5,
  seasonTarget = 25,
  changelogItems = DEFAULT_CHANGELOG,
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

          {/* Stats */}
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

          {/* CTA card */}
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

          {/* Season progress */}
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
            <ProgressSublabel variant="small">Current season</ProgressSublabel>
          </ProgressSection>

          <Divider />

          {/* Tree-Nation */}
          <TreeNationNote variant="small">
            Verified through{" "}
            <a
              href="https://tree-nation.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Tree-Nation ↗
            </a>
          </TreeNationNote>

          {/* Timeline */}
          {changelogItems.length > 0 && (
            <TimelineSection>
              <TimelineHeading>🌱 Latest leaves</TimelineHeading>
              <TimelineList>
                {changelogItems.map((item, i) => (
                  <TimelineItem key={i}>
                    <TimelineDate>{relativeTime(item.date)}</TimelineDate>
                    <TimelineText>{item.description}</TimelineText>
                  </TimelineItem>
                ))}
              </TimelineList>
            </TimelineSection>
          )}

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
