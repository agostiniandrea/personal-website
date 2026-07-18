import type { SupabaseClient } from "@supabase/supabase-js";

import { getForestImpactStats } from "@lib/utils/forestStats";

const createClient = (withError = false) => {
  const results = [
    Promise.resolve({ count: 3, data: null, error: null }),
    Promise.resolve({
      count: null,
      data: [{ trees_planted: 2 }, { trees_planted: 2 }],
      error: null,
    }),
  ];
  const implemented = Promise.resolve({
    count: 1,
    data: null,
    error: withError ? { message: "missing status column" } : null,
  });
  return {
    from: jest.fn(() => ({
      select: jest.fn(() => {
        const result = results.shift();
        return result ?? { eq: jest.fn(() => implemented) };
      }),
    })),
  } as unknown as SupabaseClient;
};

describe("getForestImpactStats", () => {
  it("returns the public impact totals used during static rendering", async () => {
    await expect(getForestImpactStats(createClient())).resolves.toEqual({
      feedbackCount: 3,
      improvementsCount: 1,
      treesDedicatedCount: 4,
    });
  });

  it("does not silently turn query failures into public zeroes", async () => {
    await expect(getForestImpactStats(createClient(true))).rejects.toThrow(
      "missing status column",
    );
  });
});
