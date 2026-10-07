import {
  FOREST_CAMPAIGN,
  getCampaignCopy,
  getCampaignProgress,
} from "../forestCampaign";
import { nextMilestoneAfter } from "../forestMilestones";

/* TEMPORARY CAMPAIGN (Oct 7–10, 2026) — delete with forestCampaign.ts */
describe("forestCampaign", () => {
  it("keeps the goal at 200", () => {
    expect(FOREST_CAMPAIGN.goal).toBe(200);
  });

  it.each([
    [179, 179, 21, false],
    [181, 181, 19, false],
    [199, 199, 1, false],
    [200, 200, 0, true],
    [201, 200, 0, true],
    [1_000, 200, 0, true],
  ])(
    "presents %i trees as %i with %i to go",
    (count, shown, remaining, reached) => {
      expect(getCampaignProgress(count)).toMatchObject({
        goal: 200,
        shown,
        remaining,
        reached,
      });
    },
  );

  it("never shows a negative remainder or a bar past 100%", () => {
    for (const count of [-5, 0, 50, 199, 200, 350]) {
      const { remaining, pct, shown } = getCampaignProgress(count);
      expect(remaining).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
      expect(shown).toBeLessThanOrEqual(200);
    }
  });

  it("survives a missing or broken count", () => {
    expect(getCampaignProgress(Number.NaN)).toMatchObject({
      shown: 0,
      remaining: 200,
      reached: false,
    });
  });

  it("leaves the regular milestone ladder alone", () => {
    expect(nextMilestoneAfter(179)).toBe(200);
    expect(nextMilestoneAfter(200)).toBe(300);
  });

  it("pluralises the countdown in both languages", () => {
    expect(getCampaignCopy("en").treesToGo(1)).toBe("1 tree to go");
    expect(getCampaignCopy("en").treesToGo(21)).toBe("21 trees to go");
    expect(getCampaignCopy("it").treesToGo(1)).toBe("Manca 1 albero");
    expect(getCampaignCopy("it").treesToGo(21)).toBe("Mancano 21 alberi");
    expect(getCampaignCopy(undefined)).toBe(FOREST_CAMPAIGN.copy.en);
  });
});
