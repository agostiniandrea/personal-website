/* ---------------------------------------------------------------------------
 * TEMPORARY — October 7–10, 2026 campaign: "Help this Forest reach 200 trees."
 *
 * Everything the campaign needs lives in this one file so it can be removed
 * cleanly after October 10:
 *
 *   1. Set `FOREST_CAMPAIGN.enabled` to false (the Forest hero and progress
 *      panel go straight back to their regular behaviour), or
 *   2. delete this file, its test, and the branches marked
 *      "TEMPORARY CAMPAIGN" in components/cms/Forest/index.tsx.
 *
 * While `enabled` is true, the copy below WINS over the Contentful values
 * (`ctaHeading`, `ctaBody`) of the Forest module. Contentful itself is not
 * touched. Nothing else changes: the tree total still comes from Tree-Nation
 * (Supabase cache, Contentful fallback), and the regular milestone ladder in
 * forestMilestones.ts keeps its 50 / 100 / 200 / 300 progression everywhere
 * else. This goal only drives the hero progress bar, so the bar can read
 * "200 / 200" instead of rolling over to "200 / 300".
 *
 * The campaign is anchored to the first anniversary of moving to Thailand
 * (Oct 10, 2025 → Oct 10, 2026). The Forest itself started in May 2026 and the
 * copy must never suggest the trees took a year to grow.
 * ------------------------------------------------------------------------- */

export type CampaignLocale = "en" | "it";

export interface CampaignCopy {
  /** Replaces the hero heading (`ctaHeading`). */
  heading: string;
  /** Replaces the hero body (`ctaBody`); one entry per paragraph. */
  body: readonly string[];
  /** The secondary anniversary line under the CTA button. */
  anniversary: string;
  /** Countdown beside the progress bar. */
  treesToGo: (remaining: number) => string;
  /** Replaces the countdown once the goal is reached. */
  goalReached: (goal: number) => string;
}

export const FOREST_CAMPAIGN = {
  enabled: true,
  /** Runs Oct 7–10, 2026 (informational — switching off is manual). */
  startsOn: "2026-10-07",
  endsOn: "2026-10-10",
  /** Only for the hero progress bar. Not part of the milestone ladder. */
  goal: 200,
  copy: {
    en: {
      heading: "Help this Forest reach 200 trees.",
      body: [
        "I'm celebrating one year in Thailand on October 10th — and I'm growing this Forest to 200 trees.",
        "Since May, meaningful feedback from people exploring this portfolio has helped turn conversations into real trees.",
      ],
      anniversary: "One year in Thailand · October 10, 2025 → October 10, 2026",
      treesToGo: (remaining: number) =>
        `${remaining} ${remaining === 1 ? "tree" : "trees"} to go`,
      goalReached: (goal: number) => `${goal} trees reached.`,
    },
    it: {
      heading: "Aiuta Forest a raggiungere 200 alberi.",
      body: [
        "Il 10 ottobre festeggio un anno in Thailandia — e sto facendo crescere questa Forest fino a 200 alberi.",
        "Da maggio, i feedback utili di chi esplora questo portfolio hanno trasformato le conversazioni in alberi veri.",
      ],
      anniversary: "Un anno in Thailandia · 10 ottobre 2025 → 10 ottobre 2026",
      treesToGo: (remaining: number) =>
        remaining === 1 ? "Manca 1 albero" : `Mancano ${remaining} alberi`,
      goalReached: (goal: number) => `${goal} alberi raggiunti.`,
    },
  } satisfies Record<CampaignLocale, CampaignCopy>,
};

export interface CampaignProgress {
  goal: number;
  /** The count the bar shows: the real total, capped at the goal. */
  shown: number;
  /** Trees still missing — never negative. */
  remaining: number;
  /** 0–100, never above 100. */
  pct: number;
  reached: boolean;
}

/**
 * Campaign view of the real tree total. Pure and read-only: the total itself
 * is never altered, only presented against the goal. Past the goal the bar
 * stays at "goal / goal" instead of climbing to "205 / 200" or "200 / 300".
 */
export function getCampaignProgress(treeCount: number): CampaignProgress {
  const goal = FOREST_CAMPAIGN.goal;
  const count = Math.max(Number.isFinite(treeCount) ? treeCount : 0, 0);
  const shown = Math.min(count, goal);
  return {
    goal,
    shown,
    remaining: goal - shown,
    pct: Math.round((shown / goal) * 100),
    reached: count >= goal,
  };
}

export function getCampaignCopy(locale?: string): CampaignCopy {
  return FOREST_CAMPAIGN.copy[locale === "it" ? "it" : "en"];
}
