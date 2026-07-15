import React, { useEffect, useRef, useState } from "react";

import { useRouter } from "next/router";

import styled, { keyframes } from "styled-components";

import { Container, Text } from "@components/ions";
import { SectionLabel } from "@components/molecules";
import { BREAKPOINTS } from "@constants";
import { trackEvent } from "@lib/utils/analytics";

import { ForestModal } from "./ForestModal";

const LABEL_DEFAULTS = {
  en: {
    feedbackCountLabel: "feedback received",
    treesDedicatedCountLabel: "trees dedicated",
    improvementsCountLabel: "improvements shipped",
  },
  it: {
    feedbackCountLabel: "feedback ricevuti",
    treesDedicatedCountLabel: "alberi dedicati",
    improvementsCountLabel: "miglioramenti realizzati",
  },
};

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
  feedbackCount?: number;
  treesDedicatedCount?: number;
  improvementsCount?: number;
  treeCount?: number;
  treeCountTitle?: string;
  ctaHeading?: string;
  ctaBody?: string;
  ctaButtonLabel?: string;
  seasonName?: string;
  seasonCurrentLabel?: string;
  treeCountLabel?: string;
  treesLabel?: string;
  viewForestLabel?: string;
  feedbackCountLabel?: string;
  treesDedicatedCountLabel?: string;
  improvementsCountLabel?: string;
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
  align-items: center;
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 999px;
  display: inline-flex;
  gap: ${({ theme }) => theme.space.sm};
  margin-bottom: 1.25rem;
  padding: 0.3rem 0.75rem 0.3rem 0.625rem;
  width: fit-content;
`;

const BadgeDot = styled.span`
  animation: ${pulse} 2.4s ease-in-out infinite;
  background: ${({ theme }) => theme.colors.highlight};
  border-radius: ${({ theme }) => theme.radii.rounded};
  flex-shrink: 0;
  height: 6px;
  width: 6px;
`;

const BadgeLabel = styled.span`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

/* ── Layout ── */

const Section = styled.section`
  padding: ${({ theme }) => theme.space["3xl"]} 0;
  position: relative;

  @media (max-width: 1199px) {
    padding: ${({ theme }) => theme.space["2xl"]} 0;
  }
`;

const SectionHeading = styled.h2`
  color: ${({ theme }) => theme.colors.headline};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: ${({ theme }) => theme.lineHeights.tight};
  margin: 0 0 1rem;
  max-width: 640px;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes["3xl"]};
  }
`;

const Subheading = styled(Text)`
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin-bottom: 2.5rem;
  max-width: 580px;
`;

/* ── Origin story ── */

const OriginBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  margin-bottom: 2.5rem;
`;

const OriginItem = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${({ theme }) => theme.space.lg};
`;

const OriginDate = styled.span`
  color: ${({ theme }) => theme.colors.paragraph};
  flex-shrink: 0;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  width: 110px;
`;

const OriginText = styled.span`
  color: ${({ theme }) => theme.colors.headline};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: ${({ theme }) => theme.lineHeights.normal};
`;

/* ── Stats ── */

const StatsGrid = styled.div<{ $count: number }>`
  display: grid;
  gap: 0.625rem;
  grid-template-columns: repeat(${({ $count }) => $count}, 1fr);
  margin-bottom: 3.5rem;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    gap: ${({ theme }) => theme.space.xl};
  }
`;

const StatItem = styled.div`
  border: 1px solid rgba(128, 128, 128, 0.15);
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xs};
  padding: 1rem 0.875rem;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    border: none;
    border-radius: 0;
    gap: 0.375rem;
    padding: 0;
  }
`;

const StatNumber = styled.span`
  color: ${({ theme }) => theme.colors.headline};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: ${({ theme }) => theme.lineHeights.tight};

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    font-size: 3.25rem;
  }
`;

const StatLabel = styled(Text)`
  color: ${({ theme }) => theme.colors.paragraph};
`;

/* ── CTA card ── */

const CtaCard = styled.div`
  background: ${({ theme }) => theme.colors.highlight}0d;
  border: 2px solid ${({ theme }) => theme.colors.highlight};
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space["2xl"]};
  margin-bottom: 2.5rem;
  padding: ${({ theme }) => theme.space["2xl"]};

  @media (min-width: ${BREAKPOINTS.tablet}) {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding: 2.5rem 3rem;
  }
`;

const CtaContent = styled.div`
  flex: 1;
`;

const CtaDecor = styled.div`
  align-items: flex-start;
  border-top: 1px solid ${({ theme }) => theme.colors.highlight}25;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xs};
  padding-top: 0.25rem;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    align-items: flex-end;
    border-left: 1px solid ${({ theme }) => theme.colors.highlight}25;
    border-top: none;
    flex-shrink: 0;
    padding-left: 3rem;
    padding-top: 0;
    text-align: right;
    width: 260px;
  }
`;

const CtaDecorTitle = styled.span`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.15em;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
`;

const CtaDecorNumber = styled.span`
  color: ${({ theme }) => theme.colors.highlight};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: 3.5rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: ${({ theme }) => theme.lineHeights.tight};

  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: 4.5rem;
  }
`;

const CtaDecorLabel = styled.span`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const CtaHeading = styled.h3`
  color: ${({ theme }) => theme.colors.headline};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin: 0 0 0.625rem;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  }
`;

const CtaBody = styled.p`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin: 0 0 1.75rem;
  max-width: 420px;
`;

const PlantButton = styled.button`
  align-items: center;
  background: ${({ theme }) => theme.colors.button};
  border: 2px solid transparent;
  border-radius: ${({ theme }) => theme.radii.xs};
  color: #ffffff;
  cursor: pointer;
  display: inline-flex;
  font-family: ${({ theme }) => theme.fontFamilies.default};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  gap: ${({ theme }) => theme.space.sm};
  padding: 0.875rem 2rem;
  transition: all 0.2s ease;

  @media (hover: hover) {
    &:hover {
      background: transparent;
      border-color: ${({ theme }) => theme.colors.highlight};
      color: ${({ theme }) => theme.colors.highlight};
    }
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
  margin-bottom: 2rem;
  padding: ${({ theme }) => theme.space.xl} 1.75rem;
`;

const SeasonHeader = styled.div`
  align-items: baseline;
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const SeasonLabel = styled.span`
  color: ${({ theme }) => theme.colors.headline};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const SeasonCount = styled.span`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const ProgressTrack = styled.div`
  background: ${({ theme }) => theme.colors.highlight}1a;
  border-radius: 999px;
  height: 8px;
  margin-bottom: 0.875rem;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $pct: number; $animate: boolean }>`
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.highlight},
    ${({ theme }) => theme.colors.highlight}cc
  );
  border-radius: 999px;
  height: 100%;
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.3s;
  width: ${({ $animate, $pct }) => ($animate ? `${Math.max($pct, 2)}%` : "2%")};
`;

const SeasonMeta = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const SeasonSublabel = styled.span`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.05em;
`;

const SeasonPct = styled.span`
  color: ${({ theme }) => theme.colors.highlight};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

/* ── View forest link ── */

const TreeNationNote = styled(Text)`
  color: ${({ theme }) => theme.colors.paragraph};
  margin-bottom: 0;

  a {
    color: ${({ theme }) => theme.colors.highlight};
    text-decoration: none;
    transition: opacity 0.2s ease;

    @media (hover: hover) {
      &:hover { opacity: 0.75; }
    }
  }
`;

/* ── Timeline ── */

const TimelineSection = styled.div``;

const TimelineHeading = styled.p`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.15em;
  margin: 0 0 1.25rem;
  text-transform: uppercase;
`;

const TimelineList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const TimelineItem = styled.li`
  align-items: baseline;
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);
  display: flex;
  gap: 1.25rem;
  padding: 0.875rem 0;

  &:first-child {
    border-top: 1px solid rgba(128, 128, 128, 0.1);
  }
`;

const TimelineDate = styled.span`
  color: ${({ theme }) => theme.colors.paragraph};
  flex-shrink: 0;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  min-width: 88px;
  white-space: nowrap;
`;

const TimelineText = styled.span`
  color: ${({ theme }) => theme.colors.headline};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: ${({ theme }) => theme.lineHeights.normal};
`;

const Divider = styled.div`
  background: rgba(128, 128, 128, 0.1);
  height: 1px;
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
  feedbackCount = 0,
  treesDedicatedCount = 0,
  improvementsCount = 0,
  treeCount = 30,
  treeCountTitle = "My Forest",
  ctaHeading = "Help this portfolio grow.",
  ctaBody = "Every meaningful suggestion plants a real tree. Your feedback grows the forest.",
  ctaButtonLabel = "🌱 Plant a leaf",
  seasonName = "Season One",
  seasonCurrentLabel = "Current season",
  treeCountLabel = "Personally planted since May 2026",
  treesLabel = "trees",
  viewForestLabel = "View the living forest",
  feedbackCountLabel,
  treesDedicatedCountLabel,
  improvementsCountLabel,
  seasonTarget = 25,
  changelogItems = [],
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { locale } = useRouter();
  const labelDefaults = locale === "it" ? LABEL_DEFAULTS.it : LABEL_DEFAULTS.en;
  const resolvedFeedbackCountLabel = feedbackCountLabel ?? labelDefaults.feedbackCountLabel;
  const resolvedTreesDedicatedCountLabel = treesDedicatedCountLabel ?? labelDefaults.treesDedicatedCountLabel;
  const resolvedImprovementsCountLabel = improvementsCountLabel ?? labelDefaults.improvementsCountLabel;

  const animFeedback = useAnimatedCounter(feedbackCount, inView);
  const animTrees = useAnimatedCounter(treesDedicatedCount, inView);
  const animImprovements = useAnimatedCounter(improvementsCount, inView);

  const pct = Math.min(seasonTarget > 0 ? (treesDedicatedCount / seasonTarget) * 100 : 0, 100);
  const visibleStats = [
    { value: animFeedback, label: resolvedFeedbackCountLabel, active: feedbackCount > 0 },
    { value: animTrees, label: resolvedTreesDedicatedCountLabel, active: treesDedicatedCount > 0 },
    { value: animImprovements, label: resolvedImprovementsCountLabel, active: improvementsCount > 0 },
  ].filter((s) => s.active);
  const hasStats = visibleStats.length >= 2;
  const resolvedOriginItems = originItems?.length ? originItems : DEFAULT_ORIGIN_ITEMS;

  const openFeedbackModal = () => {
    trackEvent("feedback_modal_opened", { locale: locale ?? "en" });
    setModalOpen(true);
  };

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
              <BadgeLabel>{badge}</BadgeLabel>
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
                <StatItem key={s.label} data-testid="stat-item">
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
                onClick={openFeedbackModal}
                aria-haspopup="dialog"
              >
                {ctaButtonLabel}
              </PlantButton>
            </CtaContent>
            <CtaDecor>
              {treeCountTitle && <CtaDecorTitle>{treeCountTitle}</CtaDecorTitle>}
              <CtaDecorNumber>{treeCount}</CtaDecorNumber>
              <CtaDecorLabel>{treeCountLabel}</CtaDecorLabel>
            </CtaDecor>
          </CtaCard>

          <SeasonCard>
            <SeasonHeader>
              <SeasonLabel>{seasonName}</SeasonLabel>
              <SeasonCount>{treesDedicatedCount} / {seasonTarget} {treesLabel}</SeasonCount>
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
