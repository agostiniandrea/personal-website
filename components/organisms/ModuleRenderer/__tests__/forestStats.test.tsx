import type { SupabaseClient } from "@supabase/supabase-js";

import { getForestImpactStats } from "@lib/utils/forestStats";

type QueryValue = {
  count: number | null;
  data: { trees_planted: number }[] | null;
  error: { message: string } | null;
};

type Filter = {
  op: "eq" | "neq" | "gt";
  column: string;
  value: string | number;
};

/* Annotated rather than inferred: the filter methods return the builder they
   belong to, which TypeScript cannot resolve on its own. */
type QueryBuilder = {
  eq: (column: string, value: string | number) => QueryBuilder;
  neq: (column: string, value: string | number) => QueryBuilder;
  gt: (column: string, value: string | number) => QueryBuilder;
  then: (
    onFulfilled: (v: QueryValue) => unknown,
    onRejected?: (e: unknown) => unknown,
  ) => Promise<unknown>;
};

/* A tiny thenable query builder, like the real one: `select(...)` can be
   awaited directly or chained through any number of filters first. Every
   filter is recorded so a test can assert which rows a query asked for. */
const queryResult = (value: QueryValue, filters: Filter[]): QueryBuilder => {
  const promise = Promise.resolve(value);
  const record =
    (op: Filter["op"]) => (column: string, filterValue: string | number) => {
      filters.push({ op, column, value: filterValue });
      return builder;
    };
  const builder: QueryBuilder = {
    eq: jest.fn(record("eq")),
    neq: jest.fn(record("neq")),
    gt: jest.fn(record("gt")),
    then: (onFulfilled, onRejected) => promise.then(onFulfilled, onRejected),
  };
  return builder;
};

const createClient = (rewardedError = false) => {
  // Consumed in Promise.all order: insights, rewarded, implemented.
  const values: QueryValue[] = [
    { count: 10, data: null, error: null },
    rewardedError
      ? { count: null, data: null, error: { message: "rewarded query failed" } }
      : {
          count: null,
          data: [{ trees_planted: 2 }, { trees_planted: 2 }],
          error: null,
        },
    { count: 8, data: null, error: null },
  ];
  const filters: Filter[] = [];
  let index = 0;
  return {
    filters,
    supabase: {
      from: jest.fn(() => ({
        select: jest.fn(() => queryResult(values[index++], filters)),
      })),
    } as unknown as SupabaseClient,
  };
};

describe("getForestImpactStats", () => {
  it("returns the public impact totals used during static rendering", async () => {
    await expect(
      getForestImpactStats(createClient().supabase),
    ).resolves.toEqual({
      insightsCollectedCount: 10,
      treesDedicatedCount: 4,
      improvementsShippedCount: 8,
      contributionsCount: 2,
    });
  });

  it("does not silently turn query failures into public zeroes", async () => {
    await expect(
      getForestImpactStats(createClient(true).supabase),
    ).rejects.toThrow("rewarded query failed");
  });

  /* Provenance no longer decides what counts. A recruited participant paid to
     look at the site still gave an insight that changes it, and the label
     never claimed the insights were unsolicited — so the only thing left out
     is what was judged junk. */
  it("counts every insight that was not rejected, whatever its source", async () => {
    const { supabase, filters } = createClient();

    await getForestImpactStats(supabase);

    expect(filters).toContainEqual({
      op: "neq",
      column: "status",
      value: "rejected",
    });
    expect(filters.filter((filter) => filter.column === "source")).toHaveLength(
      0,
    );
  });

  /* The trees and the contribution count state a ratio to the reader, so they
     have to select the same rows. `trees_planted > 0` is the condition for
     both: it is the only mark of feedback Andrea chose to reward. */
  it("identifies rewarded feedback by its trees, not by its source", async () => {
    const { supabase, filters } = createClient();

    await getForestImpactStats(supabase);

    expect(filters).toContainEqual({
      op: "gt",
      column: "trees_planted",
      value: 0,
    });
  });
});
