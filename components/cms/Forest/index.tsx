import React, { useEffect, useRef, useState } from "react";

import { useRouter } from "next/router";

import { ArrowUpRight, TreeDeciduous } from "lucide-react";
import styled, { keyframes } from "styled-components";

import { Text } from "@components/ions";
import {
  ArrowIcon,
  Badge,
  InfoTooltip,
  LeafIcon,
  Section,
  SectionLabel,
  TreeIcon,
} from "@components/molecules";
import { BREAKPOINTS, BREAKPOINTS_BELOW } from "@constants";
import { trackEvent } from "@lib/utils/analytics";
import { alpha } from "@lib/utils/color";
import { formatCo2Tonnes } from "@lib/utils/formatCo2";
import { useI18n } from "@lib/utils/i18n";

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
  /** All feedback records, any source. */
  insightsCollectedCount?: number;
  /** Trees dedicated to real community feedback (sum where source=community). */
  treesDedicatedCount?: number;
  /** Records shipped as improvements (status=implemented), any source. */
  improvementsShippedCount?: number;
  /** Community records that earned trees (source=community, trees>0). */
  communityContributionsCount?: number;
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
  seasonCurrent?: number;
  seasonTarget?: number;
  seasonProjectLabel?: string;
  seasonProjectName?: string;
  seasonProjectMeta?: string;
  seasonProjectStats?: string;
  seasonProjectTreesCount?: number;
  seasonProjectCo2Kg?: number;
  seasonProjectSpecies?: string[];
  seasonProjectUrl?: string;
  seasonProjectLinkLabel?: string;
  changelogItems?: ChangelogItem[];
}

/* Server-renders the real value (SEO, no-JS, session replays); the 0→target
   count-up is a client-only, in-view enhancement skipped for reduced motion */
function useAnimatedCounter(target: number, inView: boolean) {
  const [count, setCount] = useState(target);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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

/* Some CMS labels still start with an emoji; the icon components replace it, so
   strip it rather than render both. Harmless once the copy is emoji-free. */
function withoutLeadingEmoji(label: string): string {
  return label.replace(/^[\p{Extended_Pictographic}️\s]+/u, "");
}

function relativeTime(dateStr: string): string {
  const days = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 86_400_000,
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

const ImpactAnchor = styled.div`
  scroll-margin-top: 6rem;
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

/* Fixed width so every step's copy starts on the same vertical line, and a box
   as tall as one line of that copy so the glyph centres against the first line
   at any font size — rather than being nudged by a hand-picked offset. */
const OriginMarker = styled.span`
  align-items: center;
  color: ${({ theme }) => theme.colors.highlight};
  display: flex;
  flex: 0 0 16px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  height: ${({ theme }) => theme.lineHeights.normal}em;
  justify-content: center;
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
  margin-bottom: 1.5rem;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    gap: ${({ theme }) => theme.space.xl};
    margin-bottom: 2.5rem;
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
  background: ${({ theme }) => alpha(theme.colors.highlight, 5)};
  border: 2px solid ${({ theme }) => theme.colors.highlight};
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space["2xl"]};
  margin-bottom: 2.5rem;
  padding: ${({ theme }) => theme.space["2xl"]};

  @media (max-width: ${BREAKPOINTS_BELOW.mobile}) {
    gap: ${({ theme }) => theme.space.xl};
    margin-bottom: 1.5rem;
    padding: ${({ theme }) => theme.space.lg};
  }

  /* matches the breakpoint the rest of the Forest section switches at, so the
     card fills the row instead of stacking with empty space beside it */
  @media (min-width: ${BREAKPOINTS.xTablet}) {
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
  border-top: 1px solid ${({ theme }) => alpha(theme.colors.highlight, 15)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xs};
  padding-top: 1.25rem;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    align-items: flex-end;
    border-left: 1px solid ${({ theme }) => alpha(theme.colors.highlight, 15)};
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

  @media (max-width: ${BREAKPOINTS_BELOW.mobile}) {
    margin-bottom: 1.5rem;
    padding: ${({ theme }) => theme.space.lg};
  }
`;

const SeasonHeader = styled.div`
  align-items: baseline;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.875rem;
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
  background: ${({ theme }) => alpha(theme.colors.highlight, 10)};
  border-radius: 999px;
  height: 8px;
  margin-bottom: 0.875rem;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $pct: number; $animate: boolean }>`
  background: ${({ theme }) =>
    `linear-gradient(
      90deg,
      ${theme.colors.highlight},
      ${alpha(theme.colors.highlight, 80)}
    )`};
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

/* ── Community impact ── */

const CommunityImpact = styled.div`
  border-top: 1px solid rgba(128, 128, 128, 0.12);
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
`;

const CommunityTitle = styled.span`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const CommunityTrees = styled.span`
  color: ${({ theme }) => theme.colors.headline};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: ${({ theme }) => theme.lineHeights.tight};
`;

const CommunityMeta = styled.span`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

/* ── Season project panel ── */

const SeasonGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.space.xl};

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    gap: ${({ theme }) => theme.space["2xl"]};
    grid-template-columns: 1fr 1fr;
  }
`;

const ProjectPanel = styled.div`
  border-top: 1px solid rgba(128, 128, 128, 0.12);
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.sm};
  padding-top: ${({ theme }) => theme.space.xl};

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    border-left: 1px solid rgba(128, 128, 128, 0.12);
    border-top: none;
    padding-left: ${({ theme }) => theme.space["2xl"]};
    padding-top: 0;
  }
`;

const ProjectLabel = styled.span`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const ProjectName = styled.span`
  color: ${({ theme }) => theme.colors.headline};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: ${({ theme }) => theme.lineHeights.normal};
`;

const ProjectMeta = styled.span`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const ProjectStats = styled.span`
  color: ${({ theme }) => theme.colors.headline};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};

  /* On phones the line is too long to sit inline, so the CO₂ metric drops to
     its own row — without a leading "·" orphaning the start of the line. */
  @media (max-width: ${BREAKPOINTS_BELOW.mobile}) {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
`;

/* The CO₂ metric wraps as one unit so neither the subscript nor the "lifetime
   estimate" suffix is ever orphaned. */
const Co2Unit = styled.span`
  display: inline-block;
  white-space: nowrap;

  sub {
    font-size: 0.7em;
    line-height: 1;
  }
`;

/* The "·" separator before the CO₂ metric — hidden once it drops to its own row. */
const Co2Sep = styled.span`
  @media (max-width: ${BREAKPOINTS_BELOW.mobile}) {
    display: none;
  }
`;

const ProjectFooter = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${({ theme }) => theme.space.lg};
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.space.xs};
`;

const SpeciesList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.sm};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ProjectLink = styled.a`
  align-items: center;
  color: ${({ theme }) => theme.colors.highlight};
  display: inline-flex;
  flex-shrink: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  /* Tighter than the usual 0.375rem because this arrow is 11px, not 14-16. */
  gap: 0.25rem;
  text-decoration: none;
  transition: opacity 0.2s ease;

  @media (hover: hover) {
    &:hover {
      opacity: 0.75;
    }
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 3px;
  }
`;

/* ── View forest link ── */

/* Trust seal linking to the public Tree-Nation profile. Drawn inline so it costs
   no extra request — the point of the badge is credibility, not third-party JS. */
const VerifiedBadge = styled.a`
  align-items: center;
  border: 1px solid ${({ theme }) => alpha(theme.colors.highlight, 30)};
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.paragraph};
  display: inline-flex;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  gap: ${({ theme }) => theme.space.sm};
  padding: 0.4rem 0.875rem;
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    background 0.2s ease;
  width: fit-content;

  @media (hover: hover) {
    &:hover {
      background: ${({ theme }) => alpha(theme.colors.highlight, 6)};
      border-color: ${({ theme }) => alpha(theme.colors.highlight, 60)};
    }
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 3px;
  }
`;

/* The badge points at the forest itself, so it carries the tree — the leaf is
   reserved for a single contribution. */
const VerifiedTree = styled(TreeDeciduous)`
  color: ${({ theme }) => theme.colors.highlight};
  flex-shrink: 0;
`;

const VerifiedArrow = styled(ArrowUpRight)`
  color: ${({ theme }) => theme.colors.highlight};
  flex-shrink: 0;
`;

/* ── Timeline ── */

const TimelineSection = styled.div``;

const TimelineHeading = styled.p`
  align-items: center;
  color: ${({ theme }) => theme.colors.paragraph};
  display: flex;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  gap: 0.4rem;
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
  {
    date: "May 2026",
    text: "Started planting trees every month — a personal commitment, before any portfolio.",
  },
  {
    date: "July 2026",
    text: "Forest was born. The portfolio invites others to become part of that journey.",
  },
  {
    date: "Today",
    text: "Every meaningful suggestion grows a pair of trees — one for you, one matched by me.",
  },
];

/* ── Component ── */

const Forest: React.FC<ForestProps> = ({
  badge = "Growing in public",
  sectionLabel = "🌳 Forest",
  heading,
  subheading,
  originItems,
  insightsCollectedCount = 0,
  treesDedicatedCount = 0,
  improvementsShippedCount = 0,
  communityContributionsCount = 0,
  treeCount = 34,
  treeCountTitle,
  ctaHeading = "Help this portfolio grow.",
  ctaBody,
  ctaButtonLabel = "Plant your feedback",
  treeCountLabel = "Trees planted since May 2026",
  treesLabel,
  seasonTarget = 50,
  seasonProjectLabel = "Season One project",
  seasonProjectName,
  seasonProjectMeta,
  seasonProjectStats,
  seasonProjectTreesCount,
  seasonProjectCo2Kg,
  seasonProjectSpecies = [],
  seasonProjectUrl,
  seasonProjectLinkLabel = "View project",
  changelogItems = [],
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { locale } = useRouter();
  const t = useI18n(locale);
  const projectId =
    seasonProjectUrl?.split("/").filter(Boolean).pop() ?? "unknown";
  const hasStructuredStats =
    seasonProjectTreesCount != null && seasonProjectCo2Kg != null;

  const onCo2TooltipOpen = () => {
    trackEvent("forest_co2_tooltip_open", {
      device_type: window.matchMedia(
        `(max-width: ${BREAKPOINTS_BELOW.xTablet})`,
      ).matches
        ? "mobile"
        : "desktop",
      locale: locale ?? "en",
      project_id: projectId,
    });
  };
  const resolvedHeading = heading ?? t.forestHeading;
  const resolvedSubheading = subheading ?? t.forestSubheading;
  const resolvedCtaBody = ctaBody ?? t.forestCtaBody;
  const resolvedTreesLabel = treesLabel ?? t.forestTreesUnit;
  const resolvedMyForestTitle = treeCountTitle ?? t.forestMyForestTitle;

  const animInsights = useAnimatedCounter(insightsCollectedCount, inView);
  const animTrees = useAnimatedCounter(treesDedicatedCount, inView);
  const animImprovements = useAnimatedCounter(improvementsShippedCount, inView);

  /* Progress tracks the whole forest toward the next milestone (not just the
     community slice), so the bar reads 34/50, not 4/50. */
  const pct = Math.min(
    seasonTarget > 0 ? Math.round((treeCount / seasonTarget) * 100) : 0,
    100,
  );
  const perContribution =
    communityContributionsCount > 0
      ? Math.round(treesDedicatedCount / communityContributionsCount)
      : 0;
  const hasCommunityImpact =
    treesDedicatedCount > 0 && communityContributionsCount > 0;
  const visibleStats = [
    {
      value: animInsights,
      label: t.forestStatInsights,
      active: insightsCollectedCount > 0,
    },
    {
      value: animTrees,
      label: t.forestStatTrees,
      active: treesDedicatedCount > 0,
    },
    {
      value: animImprovements,
      label: t.forestStatImprovements,
      active: improvementsShippedCount > 0,
    },
  ].filter((s) => s.active);
  const hasStats = visibleStats.length >= 2;
  const resolvedOriginItems = originItems?.length
    ? originItems
    : DEFAULT_ORIGIN_ITEMS;

  const openFeedbackModal = () => {
    trackEvent("feedback_modal_opened", { locale: locale ?? "en" });
    setModalOpen(true);
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Section id="forest" ref={sectionRef as React.RefObject<HTMLElement>}>
        {badge && (
            <BadgeWrap>
              <BadgeDot aria-hidden="true" />
              <BadgeLabel>{badge}</BadgeLabel>
            </BadgeWrap>
          )}

          <SectionLabel>{withoutLeadingEmoji(sectionLabel)}</SectionLabel>
          <SectionHeading>{resolvedHeading}</SectionHeading>
          <Subheading variant="large">{resolvedSubheading}</Subheading>

          <OriginBlock>
            {resolvedOriginItems.map((item, i) => {
              /* The markers carry the story: it starts as a sprout, becomes a
                 tree, and the last step points forward because it's ongoing. */
              const Marker =
                i === resolvedOriginItems.length - 1
                  ? ArrowIcon
                  : i === 0
                    ? LeafIcon
                    : TreeIcon;
              return (
                <OriginItem key={item.date}>
                  <OriginDate>{item.date}</OriginDate>
                  <OriginMarker>
                    <Marker size={16} />
                  </OriginMarker>
                  <OriginText>{withoutLeadingEmoji(item.text)}</OriginText>
                </OriginItem>
              );
            })}
          </OriginBlock>

          <ImpactAnchor id="forest-impact" />

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
              <CtaBody>{resolvedCtaBody}</CtaBody>
              {/* The label is CMS copy and changes freely, so the tests hook
                  onto this id rather than onto the words. */}
              <PlantButton
                onClick={openFeedbackModal}
                aria-haspopup="dialog"
                data-testid="plant-feedback"
              >
                <LeafIcon size={17} />
                {withoutLeadingEmoji(ctaButtonLabel)}
              </PlantButton>
            </CtaContent>
            <CtaDecor>
              <CtaDecorTitle>{resolvedMyForestTitle}</CtaDecorTitle>
              <CtaDecorNumber>{treeCount}</CtaDecorNumber>
              <CtaDecorLabel>{treeCountLabel}</CtaDecorLabel>
            </CtaDecor>
          </CtaCard>

          <SeasonCard>
            <SeasonGrid>
              <div>
                <SeasonHeader>
                  <SeasonLabel>{t.forestProgressTitle}</SeasonLabel>
                  <SeasonCount>
                    {treeCount} / {seasonTarget} {resolvedTreesLabel}
                  </SeasonCount>
                </SeasonHeader>
                <ProgressTrack>
                  <ProgressFill $pct={pct} $animate={inView} />
                </ProgressTrack>
                <SeasonMeta>
                  <SeasonSublabel>{t.forestMilestone(pct)}</SeasonSublabel>
                </SeasonMeta>
                {hasCommunityImpact && (
                  <CommunityImpact data-testid="community-impact">
                    <CommunityTitle>
                      {t.forestCommunityImpactTitle}
                    </CommunityTitle>
                    <CommunityTrees>
                      {t.forestCommunityTrees(treesDedicatedCount)}
                    </CommunityTrees>
                    <CommunityMeta>
                      {t.forestContributions(communityContributionsCount)}
                      {" · "}
                      {t.forestCommunityPerContribution(perContribution)}
                    </CommunityMeta>
                  </CommunityImpact>
                )}
              </div>
              {seasonProjectName && (
                <ProjectPanel data-testid="season-project">
                  {seasonProjectLabel && (
                    <ProjectLabel>{seasonProjectLabel}</ProjectLabel>
                  )}
                  <ProjectName>{seasonProjectName}</ProjectName>
                  {seasonProjectMeta && (
                    <ProjectMeta>{seasonProjectMeta}</ProjectMeta>
                  )}
                  {hasStructuredStats ? (
                    <ProjectStats data-testid="project-stats">
                      <span>
                        {`${seasonProjectTreesCount} ${resolvedTreesLabel} · ${seasonProjectSpecies.length} ${t.speciesLabel}`}
                      </span>
                      <Co2Unit>
                        <Co2Sep>{" · "}</Co2Sep>
                        {`${formatCo2Tonnes(seasonProjectCo2Kg!, locale)} CO`}
                        <sub>2</sub>
                        {` ${t.co2LifetimeSuffix}`}
                        <InfoTooltip
                          ariaLabel={t.co2TooltipLabel}
                          onOpen={onCo2TooltipOpen}
                        >
                          {t.co2TooltipBody}
                        </InfoTooltip>
                      </Co2Unit>
                    </ProjectStats>
                  ) : (
                    seasonProjectStats && (
                      <ProjectStats data-testid="project-stats">
                        {seasonProjectStats}
                      </ProjectStats>
                    )
                  )}
                  {(seasonProjectSpecies.length > 0 || seasonProjectUrl) && (
                    <ProjectFooter>
                      {seasonProjectSpecies.length > 0 && (
                        <SpeciesList>
                          {seasonProjectSpecies.map((species) => (
                            <Badge key={species} as="li" size="sm">
                              {species}
                            </Badge>
                          ))}
                        </SpeciesList>
                      )}
                      {seasonProjectUrl && (
                        <ProjectLink
                          href={seasonProjectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {seasonProjectLinkLabel}
                          <ArrowUpRight
                            size={11}
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        </ProjectLink>
                      )}
                    </ProjectFooter>
                  )}
                </ProjectPanel>
              )}
            </SeasonGrid>
          </SeasonCard>

          <VerifiedBadge
            href="https://tree-nation.com/profile/andrea-agostini-103769"
            target="_blank"
            rel="noopener noreferrer"
          >
            <VerifiedTree size={15} strokeWidth={1.8} aria-hidden="true" />
            {t.forestVerifiedLabel}
            <VerifiedArrow size={13} strokeWidth={2} aria-hidden="true" />
          </VerifiedBadge>

          {changelogItems.length > 0 && (
            <>
              <Divider />
              <TimelineSection>
                <TimelineHeading>
                  <LeafIcon size={13} />
                  Latest leaves
                </TimelineHeading>
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
      </Section>

      <ForestModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default Forest;
