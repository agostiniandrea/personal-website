import type { SupabaseClient } from "@supabase/supabase-js";

import { getForestData } from "../treeNation";

const MKUSSU = {
  id: 269,
  name: "Replanting the burnt Mkussu Forest",
  slug: "replanting-the-burnt-mkussu-forest",
  country: "TZ",
  trees: 101,
};

const featured = {
  projectSlug: MKUSSU.slug,
  speciesNames: ["Mangrove Cannonball Tree", "Black Mangrove"],
};

const sengon = {
  label: "Sengon",
  scientific: "Paraserianthes falcataria",
  category: "Fast-growing",
  origin: "Native",
  co2Kg: 400,
};

/* Just enough of the Supabase client for forest_sync: one stored row in, and
   whatever is upserted captured. */
function fakeSupabase(row: Record<string, unknown> | null) {
  const upsert = jest.fn().mockResolvedValue({ error: null });
  const client = {
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: () => Promise.resolve({ data: row }) }),
      }),
      upsert,
    }),
  } as unknown as SupabaseClient;
  return { client, upsert };
}

const json = (body: unknown) =>
  Promise.resolve({ ok: true, json: () => Promise.resolve(body) });

/* jsdom has no fetch, so there is nothing to spy on: install a mock for the
   test and put back whatever was there. */
const originalFetch = global.fetch;
function installFetch(
  impl: (input: Parameters<typeof fetch>[0]) => Promise<unknown>,
) {
  const fetchMock = jest.fn(impl);
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

function mockTreeNation() {
  return installFetch((input) => {
    const url = String(input);
    if (url.endsWith("/api/projects/269/species")) {
      return json([{ id: 3659 }, { id: 3660 }]) as Promise<Response>;
    }
    if (url.endsWith("/api/species/3659")) {
      return json({
        name: "Xylocarpus granatum",
        common_names: "Mangrove Cannonball Tree; Cannonball Mangrove",
        category: { name: "Plant" },
        origin_type: { name: "Native" },
        life_time_CO2: 100,
      }) as Promise<Response>;
    }
    if (url.endsWith("/api/species/3660")) {
      return json({
        name: "Bruguiera gymnorhiza",
        common_names: "Black mangrove",
        category: { name: "Plant" },
        origin_type: { name: "Native" },
        life_time_CO2: 100,
      }) as Promise<Response>;
    }
    return Promise.reject(new Error(`unexpected request: ${url}`));
  });
}

/* Counters and projects are fresh in every case below, so the only thing that
   can trigger a request is the species half. */
function storedRow(species: unknown[], syncedAt: string) {
  const now = new Date().toISOString();
  return {
    id: "tree-nation",
    tree_count: 195,
    month_count: 10,
    projects: [MKUSSU],
    species,
    counters_synced_at: now,
    synced_at: syncedAt,
  };
}

describe("getForestData species cache", () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("resolves the new card's species at once when the cache belongs to another project", async () => {
    const fetchSpy = mockTreeNation();
    const { client } = fakeSupabase(
      storedRow([sengon], new Date().toISOString()),
    );

    const data = await getForestData(client, featured);

    expect(data.species.map((s) => s.scientific)).toEqual([
      "Xylocarpus granatum",
      "Bruguiera gymnorhiza",
    ]);
    expect(fetchSpy).toHaveBeenCalled();
  });

  it("never shows another project's species while the new ones cannot be resolved", async () => {
    installFetch(() => Promise.reject(new Error("Tree-Nation is down")));
    jest.spyOn(console, "error").mockImplementation(() => {});
    const { client } = fakeSupabase(
      storedRow([sengon], new Date().toISOString()),
    );

    const data = await getForestData(client, featured);

    expect(data.species).toEqual([]);
  });

  it("keeps serving a cache that matches the card without asking Tree-Nation again", async () => {
    const fetchSpy = mockTreeNation();
    const cached = [
      { ...sengon, label: "Mangrove Cannonball Tree" },
      { ...sengon, label: "Black mangrove" },
    ];
    const { client } = fakeSupabase(
      storedRow(cached, new Date().toISOString()),
    );

    const data = await getForestData(client, featured);

    expect(data.species.map((s) => s.label)).toEqual([
      "Mangrove Cannonball Tree",
      "Black mangrove",
    ]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
