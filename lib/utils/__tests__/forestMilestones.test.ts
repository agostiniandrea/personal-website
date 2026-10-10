import {
  FIRST_MILESTONE,
  isMilestoneComplete,
  lastMilestoneReached,
  MILESTONE_STEP,
  milestoneProgress,
  milestoneTarget,
} from "../forestMilestones";

describe("milestoneTarget", () => {
  it("aims at the first rung while the forest is at or below it", () => {
    expect(milestoneTarget(0)).toBe(50);
    expect(milestoneTarget(34)).toBe(50);
    expect(milestoneTarget(49)).toBe(50);
    expect(milestoneTarget(50)).toBe(50);
  });

  /* Landing exactly on a rung keeps it as the target, so a reached milestone is
     shown as reached. The target only moves on once the count exceeds it. */
  it("keeps a reached rung as the target until it is exceeded", () => {
    expect(milestoneTarget(100)).toBe(100);
    expect(milestoneTarget(200)).toBe(200);
    expect(milestoneTarget(500)).toBe(500);
    expect(milestoneTarget(51)).toBe(100);
    expect(milestoneTarget(101)).toBe(200);
    expect(milestoneTarget(501)).toBe(600);
  });

  it.each([
    [199, 200],
    [200, 200],
    [201, 300],
    [202, 300],
    [250, 300],
    [299, 300],
    [300, 300],
    [301, 400],
  ])("count %i has the target %i", (count, target) => {
    expect(milestoneTarget(count)).toBe(target);
  });

  /* No list to run off the end of: the rule holds at any scale. */
  it("keeps going far past any list anyone would have written", () => {
    expect(milestoneTarget(9_999)).toBe(10_000);
    expect(milestoneTarget(10_000)).toBe(10_000);
    expect(milestoneTarget(120_001)).toBe(120_100);
  });

  it("treats a negative or non-finite count as an empty forest", () => {
    expect(milestoneTarget(-5)).toBe(FIRST_MILESTONE);
    expect(milestoneTarget(Number.NaN)).toBe(FIRST_MILESTONE);
    expect(milestoneTarget(Number.POSITIVE_INFINITY)).toBe(FIRST_MILESTONE);
  });
});

describe("isMilestoneComplete", () => {
  it("is true only while the count sits exactly on a rung", () => {
    for (const count of [50, 100, 200, 300, 1_000]) {
      expect(isMilestoneComplete(count)).toBe(true);
    }
    for (const count of [0, 1, 49, 51, 99, 101, 199, 201, 299, 301]) {
      expect(isMilestoneComplete(count)).toBe(false);
    }
  });

  it("is false for an empty, negative or non-finite count", () => {
    expect(isMilestoneComplete(0)).toBe(false);
    expect(isMilestoneComplete(-100)).toBe(false);
    expect(isMilestoneComplete(Number.NaN)).toBe(false);
  });
});

describe("milestoneProgress", () => {
  it.each([
    [199, 200, false, 99],
    [200, 200, true, 100],
    [201, 300, false, 67],
    [202, 300, false, 67],
    [250, 300, false, 83],
    [299, 300, false, 99],
    [300, 300, true, 100],
    [301, 400, false, 75],
  ])("count %i reads %i, complete %s, %i%%", (count, target, complete, pct) => {
    expect(milestoneProgress(count)).toEqual({ target, complete, pct });
  });

  it("handles the first rung and the edges around it", () => {
    expect(milestoneProgress(0)).toEqual({
      target: 50,
      complete: false,
      pct: 0,
    });
    expect(milestoneProgress(49)).toEqual({
      target: 50,
      complete: false,
      pct: 98,
    });
    expect(milestoneProgress(50)).toEqual({
      target: 50,
      complete: true,
      pct: 100,
    });
    expect(milestoneProgress(51)).toEqual({
      target: 100,
      complete: false,
      pct: 51,
    });
    expect(milestoneProgress(100)).toEqual({
      target: 100,
      complete: true,
      pct: 100,
    });
  });

  /* The bar must not look finished one tree early (299/300 is 99.67%). */
  it("shows 100% only on the milestone itself", () => {
    for (let count = 1; count <= 1_200; count++) {
      const { pct, complete } = milestoneProgress(count);
      expect(pct === 100).toBe(complete);
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    }
  });

  it("never moves the bar backwards between milestones", () => {
    for (let count = 202; count <= 299; count++) {
      expect(milestoneProgress(count).pct).toBeGreaterThanOrEqual(
        milestoneProgress(count - 1).pct,
      );
    }
  });

  it("treats a negative or non-finite count as an empty forest", () => {
    expect(milestoneProgress(-5)).toEqual({
      target: 50,
      complete: false,
      pct: 0,
    });
    expect(milestoneProgress(Number.NaN)).toEqual({
      target: 50,
      complete: false,
      pct: 0,
    });
  });
});

describe("lastMilestoneReached", () => {
  it("reports nothing before the first rung", () => {
    expect(lastMilestoneReached(0)).toBeNull();
    expect(lastMilestoneReached(49)).toBeNull();
  });

  it("reports the first rung from the moment it falls until the next", () => {
    expect(lastMilestoneReached(50)).toBe(50);
    expect(lastMilestoneReached(83)).toBe(50);
    expect(lastMilestoneReached(99)).toBe(50);
  });

  it("reports only the most recent rung, not the whole history", () => {
    expect(lastMilestoneReached(100)).toBe(100);
    expect(lastMilestoneReached(199)).toBe(100);
    expect(lastMilestoneReached(200)).toBe(200);
    expect(lastMilestoneReached(283)).toBe(200);
    expect(lastMilestoneReached(1_240)).toBe(1_200);
  });

  it("treats a negative or non-finite count as an empty forest", () => {
    expect(lastMilestoneReached(-5)).toBeNull();
    expect(lastMilestoneReached(Number.NaN)).toBeNull();
  });
});

describe("the two together", () => {
  /* The rung behind never exceeds the count and the rung ahead is never below
     it; the two are equal exactly when a milestone is complete. */
  it("always brackets the count", () => {
    for (const count of [
      1, 49, 50, 51, 99, 100, 101, 199, 200, 201, 833, 5_000,
    ]) {
      const target = milestoneTarget(count);
      const last = lastMilestoneReached(count);

      expect(target).toBeGreaterThanOrEqual(count);
      if (last !== null) {
        expect(last).toBeLessThanOrEqual(count);
        expect(target - last).toBeLessThanOrEqual(MILESTONE_STEP);
        expect(last === target).toBe(isMilestoneComplete(count));
      }
    }
  });
});
