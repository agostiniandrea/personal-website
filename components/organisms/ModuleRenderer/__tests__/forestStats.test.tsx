import type { SupabaseClient } from "@supabase/supabase-js";

import { getForestImpactStats } from "@lib/utils/forestStats";

type QueryValue = {
  count: number | null;
  data: { trees_planted: number }[] | null;
  error: { message: string } | null;
};

/* A tiny thenable query builder: `select(...)` can be awaited directly (the
   count queries) or chained through `.eq(...)` (the source/status filters). */
const queryResult = (value: QueryValue) => {
  const promise = Promise.resolve(value);
  return {
    eq: jest.fn(() => promise),
    then: (
      onFulfilled: (v: QueryValue) => unknown,
      onRejected?: (e: unknown) => unknown,
    ) => promise.then(onFulfilled, onRejected),
  };
};

const createClient = (communityError = false) => {
  // Consumed in Promise.all order: insights, community, implemented.
  const values: QueryValue[] = [
    { count: 10, data: null, error: null },
    communityError
      ? { count: null, data: null, error: { message: "community query failed" } }
      : {
          count: null,
          data: [{ trees_planted: 2 }, { trees_planted: 2 }],
          error: null,
        },
    { count: 8, data: null, error: null },
  ];
  let index = 0;
  return {
    from: jest.fn(() => ({
      select: jest.fn(() => queryResult(values[index++])),
    })),
  } as unknown as SupabaseClient;
};

describe("getForestImpactStats", () => {
  it("returns the public impact totals used during static rendering", async () => {
    await expect(getForestImpactStats(createClient())).resolves.toEqual({
      insightsCollectedCount: 10,
      treesDedicatedCount: 4,
      improvementsShippedCount: 8,
      communityContributionsCount: 2,
    });
  });

  it("does not silently turn query failures into public zeroes", async () => {
    await expect(getForestImpactStats(createClient(true))).rejects.toThrow(
      "community query failed",
    );
  });
});
