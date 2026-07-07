import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { Container, Text } from "@components/ions";
import { BREAKPOINTS } from "@constants";
import { ForestModal } from "./ForestModal";

export interface ChangelogItem {
  date: string;
  description: string;
}

export interface OriginItem {
  date: string;
  text: string;
}

export interface ForestProps {
  badge?: string;
  sectionLabel?: string;
  heading?: string;
  subheading?: string;
  originItems?: OriginItem[];
  reviewCount?: number;
  treeCount?: number;
  improvementsCount?: number;
  ctaHeading?: string;
  ctaBody?: string;
  ctaButtonLabel?: string;
  seasonName?: string;
  seasonCurrentLabel?: string;
  treeCountLabel?: string;
  viewForestLabel?: string;
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

/* ── Animations ── */

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.75); }
`;

/* ── Badge ── */

const BadgeWrap = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.75rem 0.3rem 0.625rem;
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 999px;
  margin-bottom: 1.25rem;
  width: fit-content;
`;

const BadgeDot = styled.span`
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.highlight};
  animation: ${pulse} 2.4s ease-in-out infinite;
`;

const BadgeLabel = styled.span`
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.paragraph};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

/* ── Layout ── */

const Section = styled.section`
  padding: 3rem 0;
  position: relative;

  @media (max-width: 1199px) {
    padding: 2rem 0;
  }
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
  margin-bottom: 2.5rem;
`;

/* ── Origin story ── */

const OriginBlock = styled.div`
  margin-bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
`;

const OriginItem = styled.div`
  display: flex;
  align-items: baseline;
  gap: 1rem;
`;

const OriginDate = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.paragraph};
  white-space: nowrap;
  min-width: 88px;
  flex-shrink: 0;
`;

const OriginText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.headline};
  line-height: ${({ theme }) => theme.lineHeights.normal};
`;

/* ── Stats ── */

const StatsGrid = styled.div<{ $count: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $count }) => $count}, 1fr);
  gap: 0.625rem;
  margin-bottom: 3.5rem;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    gap: 1.5rem;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border: 1px solid rgba(128, 128, 128, 0.15);
  border-radius: 0.75rem;
  padding: 1rem 0.875rem;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    border: none;
    border-radius: 0;
    padding: 0;
    gap: 0.375rem;
  }
`;

const StatNumber = styled.span`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: 2rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.headline};
  line-height: 1;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    font-size: 3.25rem;
  }
`;

const StatLabel = styled(Text)`
  color: ${({ theme }) => theme.colors.paragraph};
`;

/* ── CTA card ── */

const CtaCard = styled.div`
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2.5rem;
  background: ${({ theme }) => theme.colors.highlight}0d;
  border: 2px solid ${({ theme }) => theme.colors.highlight};
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 2.5rem 3rem;
  }
`;

const CtaContent = styled.div`
  flex: 1;
`;

const CtaDecor = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  padding-top: 0.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.highlight}25;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    border-top: none;
    border-left: 1px solid ${({ theme }) => theme.colors.highlight}25;
    padding-top: 0;
    padding-left: 3rem;
    align-items: flex-start;
    min-width: 180px;
  }
`;

const CtaDecorNumber = styled.span`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: 3.5rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.highlight};
  line-height: 1;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: 4.5rem;
  }
`;

const CtaDecorLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.highlight};
  opacity: 0.7;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const CtaHeading = styled.h3`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.headline};
  margin: 0 0 0.625rem;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  }
`;

const CtaBody = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.paragraph};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin: 0 0 1.75rem;
  max-width: 420px;
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
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 3px;
  }
`;

/* ── Season card ── */

const SeasonCard = styled.div`
  border: 1px solid rgba(128, 128, 128, 0.15);
  border-radius: 1rem;
  padding: 1.5rem 1.75rem;
  margin-bottom: 2rem;
`;

const SeasonHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 1rem;
`;

const SeasonLabel = styled.span`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.headline};
`;

const SeasonCount = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.paragraph};
`;

const ProgressTrack = styled.div`
  height: 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.highlight}1a;
  overflow: hidden;
  margin-bottom: 0.875rem;
`;

const ProgressFill = styled.div<{ $pct: number; $animate: boolean }>`
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.highlight},
    ${({ theme }) => theme.colors.highlight}cc
  );
  width: ${({ $animate, $pct }) => ($animate ? `${Math.max($pct, 2)}%` : "2%")};
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.3s;
`;

const SeasonMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SeasonSublabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.paragraph};
  letter-spacing: 0.05em;
`;

const SeasonPct = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.highlight};
`;

/* ── View forest link ── */

const TreeNationNote = styled(Text)`
  color: ${({ theme }) => theme.colors.paragraph};
  margin-bottom: 0;

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
  margin: 0 0 1.25rem;
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

const Divider = styled.div`
  height: 1px;
  background: rgba(128, 128, 128, 0.1);
  margin: 2.5rem 0;
`;

/* ── Fallback origin story (EN) ── */

const DEFAULT_ORIGIN_ITEMS: OriginItem[] = [
  { date: "May 2026",  text: "🌱  Started planting trees every month — a personal commitment, before any portfolio." },
  { date: "July 2026", text: "🌳  Forest was born. The portfolio invites others to become part of that journey." },
  { date: "Today",     text: "→  Every meaningful suggestion earns a dedicated tree from my forest." },
];

/* ── Component ── */

const Forest: React.FC<ForestProps> = ({
  badge = "Growing in public",
  sectionLabel = "🌳 Forest",
  heading = "This portfolio grows with your feedback.",
  subheading = "Forest didn't start with this website. It started months earlier — a personal commitment to give something back. This page simply invites others to become part of that journey.",
  originItems,
  reviewCount = 0,
  treeCount = 30,
  improvementsCount = 0,
  ctaHeading = "Help this portfolio grow.",
  ctaBody = "Every meaningful suggestion earns a new tree. My goal: 25 trees planted through feedback this season.",
  ctaButtonLabel = "🌱 Plant a leaf",
  seasonName = "Season One",
  seasonCurrentLabel = "Current season",
  treeCountLabel = "planted since May 2026",
  viewForestLabel = "View the living forest",
  seasonCurrent = 0,
  seasonTarget = 25,
  changelogItems = [],
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const reviews = useAnimatedCounter(reviewCount, inView);
  const trees = useAnimatedCounter(treeCount, inView);
  const improvements = useAnimatedCounter(improvementsCount, inView);

  const pct = Math.min(seasonTarget > 0 ? (seasonCurrent / seasonTarget) * 100 : 0, 100);
  const visibleStats = [
    { value: reviews, label: "reviews", active: reviewCount > 0 },
    { value: improvements, label: "improvements shipped", active: improvementsCount > 0 },
  ].filter((s) => s.active);
  const hasStats = visibleStats.length > 0;
  const resolvedOriginItems = originItems?.length ? originItems : DEFAULT_ORIGIN_ITEMS;

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

          {badge && (
            <BadgeWrap>
              <BadgeDot aria-hidden="true" />
              <BadgeLabel>Growing in public</BadgeLabel>
            </BadgeWrap>
          )}

          <SectionLabel>{sectionLabel}</SectionLabel>
          <SectionHeading>{heading}</SectionHeading>
          <Subheading variant="large">{subheading}</Subheading>

          <OriginBlock>
            {resolvedOriginItems.map((item) => (
              <OriginItem key={item.date}>
                <OriginDate>{item.date}</OriginDate>
                <OriginText>{item.text}</OriginText>
              </OriginItem>
            ))}
          </OriginBlock>

          {hasStats && (
            <StatsGrid $count={visibleStats.length}>
              {visibleStats.map((s) => (
                <StatItem key={s.label}>
                  <StatNumber>{s.value}</StatNumber>
                  <StatLabel variant="small">{s.label}</StatLabel>
                </StatItem>
              ))}
            </StatsGrid>
          )}

          <CtaCard>
            <CtaContent>
              <CtaHeading>{ctaHeading}</CtaHeading>
              <CtaBody>{ctaBody}</CtaBody>
              <PlantButton
                onClick={() => setModalOpen(true)}
                aria-haspopup="dialog"
              >
                {ctaButtonLabel}
              </PlantButton>
            </CtaContent>
            <CtaDecor>
              <CtaDecorNumber>{treeCount}</CtaDecorNumber>
              <CtaDecorLabel>{treeCountLabel}</CtaDecorLabel>
            </CtaDecor>
          </CtaCard>

          <SeasonCard>
            <SeasonHeader>
              <SeasonLabel>{seasonName}</SeasonLabel>
              <SeasonCount>{seasonCurrent} / {seasonTarget} trees</SeasonCount>
            </SeasonHeader>
            <ProgressTrack>
              <ProgressFill $pct={pct} $animate={inView} />
            </ProgressTrack>
            <SeasonMeta>
              <SeasonSublabel>{seasonCurrentLabel}</SeasonSublabel>
              <SeasonPct>{Math.round(pct)}%</SeasonPct>
            </SeasonMeta>
          </SeasonCard>

          <TreeNationNote variant="small">
            <a
              href="https://tree-nation.com/profile/andrea-agostini-103769"
              target="_blank"
              rel="noopener noreferrer"
            >
              {viewForestLabel}
              <svg
                width="11"
                height="11"
                viewBox="0 0 11 11"
                fill="none"
                aria-hidden="true"
                style={{ display: "inline-block", marginLeft: "0.25rem", verticalAlign: "middle", position: "relative", top: "-1px" }}
              >
                <path d="M2 9L9 2M9 2H4M9 2V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </TreeNationNote>

          {changelogItems.length > 0 && (
            <>
              <Divider />
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
            </>
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
