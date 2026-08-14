import type { SupabaseClient } from "@supabase/supabase-js";

import { getForestImpactStats } from "@lib/utils/forestStats";

type QueryValue = {
  count: number | null;
  data: { trees_planted: number }[] | null;
  error: { message: string } | null;
};

type Filter = { op: "eq" | "neq"; column: string; value: string };

/* Annotated rather than inferred: the filter methods return the builder they
   belong to, which TypeScript cannot resolve on its own. */
type QueryBuilder = {
  eq: (column: string, value: string) => QueryBuilder;
  neq: (column: string, value: string) => QueryBuilder;
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
    (op: Filter["op"]) => (column: string, filterValue: string) => {
      filters.push({ op, column, value: filterValue });
      return builder;
    };
  const builder: QueryBuilder = {
    eq: jest.fn(record("eq")),
    neq: jest.fn(record("neq")),
    then: (onFulfilled, onRejected) => promise.then(onFulfilled, onRejected),
  };
  return builder;
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
      communityContributionsCount: 2,
    });
  });

  it("does not silently turn query failures into public zeroes", async () => {
    await expect(
      getForestImpactStats(createClient(true).supabase),
    ).rejects.toThrow("community query failed");
  });

  /* Solicited, paid usability-study feedback is not an insight the site
     earned. Both published counts have to filter it out; the trees query
     already asks for community rows only. */
  it("keeps usability study submissions out of the published counters", async () => {
    const { supabase, filters } = createClient();

    await getForestImpactStats(supabase);

    expect(
      filters.filter(
        (filter) =>
          filter.op === "neq" &&
          filter.column === "source" &&
          filter.value === "usability_study",
      ),
    ).toHaveLength(2);
    expect(filters).toContainEqual({
      op: "eq",
      column: "source",
      value: "community",
    });
  });
});
