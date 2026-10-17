import type { NextApiRequest, NextApiResponse } from "next";

import handler from "../../../pages/api/admin/summary";

/* Same approach as the feedback API test: a mocked admin check and a fake
   Supabase client. Lives under lib/ because jest's testMatch does not cover
   pages/. */

const mockAuthenticate = jest.fn();
jest.mock("@lib/admin/access", () => ({
  authenticateAdmin: (...args: unknown[]) => mockAuthenticate(...args),
}));

const mockCreateClient = jest.fn();
jest.mock("@supabase/supabase-js", () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));

let countError: { message: string } | null;
let syncRow: Record<string, unknown> | null;
let forestError: { message: string } | null;

const fakeClient = () => ({
  from: (table: string) => ({
    select: (columns: string, options?: { head?: boolean }) => {
      if (options?.head) {
        return {
          eq: (_column: string, status: string) =>
            Promise.resolve({
              count: { pending: 4, accepted: 2, rejected: 1, implemented: 3 }[
                status
              ],
              error: countError,
            }),
        };
      }
      if (table === "forest_sync") {
        return {
          eq: () => ({
            maybeSingle: () =>
              Promise.resolve({ data: syncRow, error: forestError }),
          }),
        };
      }
      return {
        gt: () =>
          Promise.resolve({
            data:
              columns === "trees_planted"
                ? [{ trees_planted: 1 }, { trees_planted: 2 }]
                : [],
            error: forestError,
          }),
      };
    },
  }),
});

const makeRes = () => {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    headers: {} as Record<string, string>,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      res.body = payload;
      return res;
    },
    setHeader(name: string, value: string) {
      res.headers[name] = value;
      return res;
    },
  };
  return res;
};

const call = async (method = "GET") => {
  const res = makeRes();
  await handler(
    { method, headers: {}, query: {} } as unknown as NextApiRequest,
    res as unknown as NextApiResponse,
  );
  return res;
};

const originalEnv = { ...process.env };

beforeEach(() => {
  countError = null;
  forestError = null;
  syncRow = {
    tree_count: 198,
    month_count: 12,
    synced_at: "2026-10-17T03:30:00.000Z",
  };
  mockAuthenticate.mockReset();
  mockAuthenticate.mockResolvedValue({ email: "andrea@example.com" });
  mockCreateClient.mockReset();
  mockCreateClient.mockImplementation(() => fakeClient());
  process.env = {
    ...originalEnv,
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
  };
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  process.env = originalEnv;
  jest.restoreAllMocks();
});

describe("admin summary API", () => {
  it("answers 401 to anyone who is not an admin, before touching the database", async () => {
    mockAuthenticate.mockResolvedValue(null);
    const res = await call();
    expect(res.statusCode).toBe(401);
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("returns who is signed in and the feedback counts, uncached", async () => {
    const res = await call();
    expect(res.statusCode).toBe(200);
    expect(res.headers["Cache-Control"]).toBe("no-store");
    expect(res.body).toEqual({
      email: "andrea@example.com",
      feedback: {
        counts: { pending: 4, accepted: 2, rejected: 1, implemented: 3 },
      },
      forest: {
        treeCount: 198,
        monthCount: 12,
        syncedAt: "2026-10-17T03:30:00.000Z",
        dedicatedTrees: 3,
        contributions: 2,
      },
    });
  });

  it("still returns the feedback numbers when the forest cannot be read", async () => {
    forestError = { message: "forest_sync unavailable" };
    const res = await call();
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      feedback: { counts: { pending: 4 } },
      forest: null,
    });
  });

  it("only answers GET", async () => {
    expect((await call("POST")).statusCode).toBe(405);
  });

  it("fails with a generic 500 and no database detail", async () => {
    countError = { message: "relation secret_table does not exist" };
    const res = await call();
    expect(res.statusCode).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain("secret_table");
  });
});
