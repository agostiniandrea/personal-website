/* ---------------------------------------------------------------------------
 * The milestone ladder: 50, then every 100 — 50, 100, 200, 300 … forever.
 *
 * A rule rather than a list, because a list is a thing that goes stale. The
 * previous model held a single fixed target in the CMS, and the moment the
 * forest passed it the panel read "50 / 50 complete" under a headline of 57,
 * where the gap only widened with every tree.
 *
 * The step stays constant instead of widening with the total. At roughly two
 * dozen trees a month that lands a milestone every four months or so, which is
 * the cadence Season One actually had. A widening ladder would make each one
 * slower than the last, and a progress bar that stops moving is worse than no
 * progress bar.
 *
 * 50 is the first rung on its own: it is the only one below the step, and it is
 * already behind us, so a forest opening on this model has something to show
 * from the start.
 * ------------------------------------------------------------------------- */

export const FIRST_MILESTONE = 50;
export const MILESTONE_STEP = 100;

/**
 * The rung the forest is climbing towards. Always strictly above the count, so
 * landing exactly on a milestone advances to the next one rather than leaving
 * the bar pinned at 100%.
 */
export function nextMilestoneAfter(treeCount: number): number {
  const count = Math.max(treeCount, 0);
  if (count < FIRST_MILESTONE) return FIRST_MILESTONE;
  return (Math.floor(count / MILESTONE_STEP) + 1) * MILESTONE_STEP;
}

/**
 * The highest rung already behind us, or null before the first one. Only the
 * most recent is reported: at a thousand trees the full list would be ten
 * badges of clutter, and the headline total already carries the scale.
 */
export function lastMilestoneReached(treeCount: number): number | null {
  const count = Math.max(treeCount, 0);
  if (count < FIRST_MILESTONE) return null;
  if (count < MILESTONE_STEP) return FIRST_MILESTONE;
  return Math.floor(count / MILESTONE_STEP) * MILESTONE_STEP;
}
