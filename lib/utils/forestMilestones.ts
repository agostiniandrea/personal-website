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
 *
 * A rung stays the target while the count is on it (see milestoneTarget), so a
 * completed milestone is shown as completed instead of vanishing the moment it
 * is reached.
 * ------------------------------------------------------------------------- */

export const FIRST_MILESTONE = 50;
export const MILESTONE_STEP = 100;

/**
 * The rung the forest is currently on its way to: the smallest rung that is not
 * below the count. Landing exactly on a milestone keeps it as the target, so
 * the panel reads "200 / 200" (a completed milestone) until the next tree is
 * planted, and only then moves on — 201 reads "201 / 300", never "1 / 300".
 */
export function milestoneTarget(treeCount: number): number {
  const count = Number.isFinite(treeCount) ? Math.max(treeCount, 0) : 0;
  if (count <= FIRST_MILESTONE) return FIRST_MILESTONE;
  return Math.ceil(count / MILESTONE_STEP) * MILESTONE_STEP;
}

/** True while the count sits exactly on a rung: the milestone is complete and
    still the target. One tree later it is behind us and the target advances. */
export function isMilestoneComplete(treeCount: number): boolean {
  const count = Number.isFinite(treeCount) ? Math.max(treeCount, 0) : 0;
  return count > 0 && count === milestoneTarget(count);
}

export interface MilestoneProgress {
  /** The rung being climbed (the denominator: "201 / 300"). */
  target: number;
  /** The count sits exactly on the target. */
  complete: boolean;
  /** 0–100 fill of the bar. The numerator stays the cumulative count, so the
      bar is count / target; it is 100 only on the milestone itself — a count
      one tree short rounds down instead of looking finished. */
  pct: number;
}

export function milestoneProgress(treeCount: number): MilestoneProgress {
  const count = Number.isFinite(treeCount) ? Math.max(treeCount, 0) : 0;
  const target = milestoneTarget(count);
  const complete = isMilestoneComplete(count);
  const pct = complete ? 100 : Math.min(Math.floor((count / target) * 100), 99);
  return { target, complete, pct };
}

/**
 * The highest rung already behind us, or null before the first one. Only the
 * most recent is reported: at a thousand trees the full list would be ten
 * badges of clutter, and the headline total already carries the scale.
 */
export function lastMilestoneReached(treeCount: number): number | null {
  const count = Number.isFinite(treeCount) ? Math.max(treeCount, 0) : 0;
  if (count < FIRST_MILESTONE) return null;
  if (count < MILESTONE_STEP) return FIRST_MILESTONE;
  return Math.floor(count / MILESTONE_STEP) * MILESTONE_STEP;
}
