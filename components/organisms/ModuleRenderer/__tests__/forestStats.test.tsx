import type { SupabaseClient } from "@supabase/supabase-js";

import { getForestImpactStats } from "@lib/utils/forestStats";

const createClient = (withError = false) => {
  const results: Promise<{
    count: number | null;
    data: { trees_planted: number }[] | null;
    error: { message: string } | null;
  }>[] = [
    Promise.resolve({ count: 3, data: null, error: null }),
    Promise.resolve({
      count: null,
      data: [{ trees_planted: 2 }, { trees_planted: 2 }],
      error: null,
    }),
  ];
  if (withError) {
    results[1] = Promise.resolve({
      count: null,
      data: null,
      error: { message: "trees query failed" },
    });
  }
  return {
    from: jest.fn(() => ({
      select: jest.fn(() => {
        const result = results.shift();
        return result;
      }),
    })),
  } as unknown as SupabaseClient;
};

describe("getForestImpactStats", () => {
  it("returns the public impact totals used during static rendering", async () => {
    await expect(getForestImpactStats(createClient())).resolves.toEqual({
      feedbackCount: 3,
      rewardedFeedbackCount: 2,
      treesDedicatedCount: 4,
    });
  });

  it("does not silently turn query failures into public zeroes", async () => {
    await expect(getForestImpactStats(createClient(true))).rejects.toThrow(
      "trees query failed",
    );
  });
});
