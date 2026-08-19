import {
  FIRST_MILESTONE,
  lastMilestoneReached,
  MILESTONE_STEP,
  nextMilestoneAfter,
} from "../forestMilestones";

describe("nextMilestoneAfter", () => {
  it("aims at the first rung while the forest is below it", () => {
    expect(nextMilestoneAfter(0)).toBe(50);
    expect(nextMilestoneAfter(34)).toBe(50);
    expect(nextMilestoneAfter(49)).toBe(50);
  });

  /* Landing exactly on a rung advances past it. Otherwise the bar would sit at
     100% until the next tree, which reports nothing. */
  it("advances the moment a rung is reached", () => {
    expect(nextMilestoneAfter(50)).toBe(100);
    expect(nextMilestoneAfter(100)).toBe(200);
    expect(nextMilestoneAfter(500)).toBe(600);
  });

  it("steps by a hundred between rungs", () => {
    expect(nextMilestoneAfter(83)).toBe(100);
    expect(nextMilestoneAfter(150)).toBe(200);
    expect(nextMilestoneAfter(1_240)).toBe(1_300);
  });

  /* No list to run off the end of: the rule holds at any scale, which is the
     whole reason it is a rule. */
  it("keeps going far past any list anyone would have written", () => {
    expect(nextMilestoneAfter(9_999)).toBe(10_000);
    expect(nextMilestoneAfter(120_001)).toBe(120_100);
  });

  it("treats a negative count as an empty forest", () => {
    expect(nextMilestoneAfter(-5)).toBe(FIRST_MILESTONE);
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
    expect(lastMilestoneReached(283)).toBe(200);
    expect(lastMilestoneReached(1_240)).toBe(1_200);
  });

  it("treats a negative count as an empty forest", () => {
    expect(lastMilestoneReached(-5)).toBeNull();
  });
});

describe("the two together", () => {
  /* The pair drives one sentence — "N trees reached · X / Y trees" — so the
     rung behind must always sit below the count, and the rung ahead above it. */
  it("always brackets the count", () => {
    for (const count of [0, 1, 49, 50, 51, 99, 100, 101, 199, 833, 5_000]) {
      const next = nextMilestoneAfter(count);
      const last = lastMilestoneReached(count);

      expect(next).toBeGreaterThan(count);
      if (last !== null) {
        expect(last).toBeLessThanOrEqual(count);
        expect(next - last).toBeLessThanOrEqual(MILESTONE_STEP);
      }
    }
  });
});
