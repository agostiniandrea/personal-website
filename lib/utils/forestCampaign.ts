/* ---------------------------------------------------------------------------
 * TEMPORARY — the 200-tree campaign (Oct 7–10, 2026) and its celebration.
 *
 * The countdown "Help this Forest reach 200 trees." ran October 7–10, 2026 and
 * the goal has been reached. What stays here is the celebration copy, so the
 * Forest hero stops asking for help with a milestone that is already behind us.
 *
 * Everything lives in this one file so it can be removed cleanly:
 *
 *   1. Set `FOREST_CAMPAIGN.enabled` to false (the Forest hero goes straight
 *      back to the Contentful `ctaHeading`, `ctaBody` and `ctaButtonLabel`), or
 *   2. delete this file, its test, and the branches marked
 *      "TEMPORARY CAMPAIGN" in components/cms/Forest/index.tsx.
 *
 * While `enabled` is true, the copy below WINS over the Contentful values.
 * Contentful itself is not touched. Nothing else changes: the tree total still
 * comes from Tree-Nation (Supabase cache, Contentful fallback), and the
 * progress panel follows the regular milestone ladder in forestMilestones.ts
 * (50 / 100 / 200 / 300 …), so it keeps moving on its own.
 *
 * `goalProgress` is the countdown mode: while true, the progress panel shows
 * the total against `goal` ("179 / 200", then a pinned "200 / 200"). It is off
 * now, because a bar pinned at 200 would stop reflecting the forest as soon as
 * it grew past it.
 *
 * The one-year-in-Thailand anniversary has its own switch in
 * thailandAnniversary.ts, so the two can come down separately. The Forest itself
 * started in May 2026 and the copy must never suggest the trees took a year to
 * grow.
 * ------------------------------------------------------------------------- */

export type CampaignLocale = "en" | "it";

export interface CampaignCopy {
  /** Replaces the hero heading (`ctaHeading`). */
  heading: string;
  /** The words of `heading` set in the milestone gold. Must appear in it. */
  headingAccent: string;
  /** Replaces the hero body (`ctaBody`); one entry per paragraph. */
  body: readonly string[];
  /** Replaces the hero button label (`ctaButtonLabel`). */
  ctaLabel: string;
  /** Countdown beside the progress bar. */
  treesToGo: (remaining: number) => string;
  /** Replaces the countdown once the goal is reached. */
  goalReached: (goal: number) => string;
}

export const FOREST_CAMPAIGN = {
  enabled: true,
  /** The countdown ran Oct 7–10, 2026 (informational — switching off is manual). */
  startsOn: "2026-10-07",
  endsOn: "2026-10-10",
  /** Countdown mode of the progress panel. Off: the goal was reached and the
      panel follows the regular milestone ladder instead. */
  goalProgress: false,
  /** Only used while `goalProgress` is on. Not part of the milestone ladder. */
  goal: 200,
  copy: {
    en: {
      heading: "This Forest has reached 200 trees.",
      headingAccent: "200 trees",
      body: [
        "Thank you to everyone whose feedback has helped turn conversations into real trees since May.",
        "The Forest keeps growing: every meaningful contribution can still shape the portfolio. Community feedback grows a pair of real trees — one dedicated to you, one matched by me.",
      ],
      ctaLabel: "Keep the Forest growing",
      treesToGo: (remaining: number) =>
        `${remaining} ${remaining === 1 ? "tree" : "trees"} to go`,
      goalReached: (goal: number) => `${goal} trees reached.`,
    },
    it: {
      heading: "Questa Forest ha raggiunto i 200 alberi.",
      headingAccent: "200 alberi",
      body: [
        "Grazie a chi, da maggio, ha contribuito con i propri feedback a trasformare le conversazioni in alberi veri.",
        "La Forest continua a crescere: ogni contributo significativo può ancora dare forma al portfolio. I feedback della community fanno crescere due alberi veri — uno dedicato a te, uno che aggiungo io.",
      ],
      ctaLabel: "Fai crescere ancora la Forest",
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
