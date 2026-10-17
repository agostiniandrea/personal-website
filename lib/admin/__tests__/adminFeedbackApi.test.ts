import type { NextApiRequest, NextApiResponse } from "next";

import handler from "../../../pages/api/admin/feedback";

/* The handler runs against a fake Supabase client and a mocked admin check:
   what matters here is who gets in, what is written and which columns can be
   touched, not the database. Lives under lib/ because jest's testMatch does
   not cover pages/. */

const mockAuthenticate = jest.fn();
jest.mock("@lib/admin/access", () => ({
  authenticateAdmin: (...args: unknown[]) => mockAuthenticate(...args),
}));

const mockCreateClient = jest.fn();
jest.mock("@supabase/supabase-js", () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));

type Row = Record<string, unknown>;

const ID = "5f2a1b9c-4d3e-4f1a-8b9c-8d7e60d5f8a2";
const ROW: Row = { id: ID, status: "pending", category: "UX", message: "Hi" };

let listCalls: { method: string; args: unknown[] }[] = [];
let updates: { values: Row; id?: unknown }[] = [];
let updateResult: { data: Row | null; error: { message: string } | null };
let listError: { message: string } | null;

const listBuilder = () => {
  const builder: Record<string, unknown> = {};
  for (const method of ["order", "range", "eq"]) {
    builder[method] = (...args: unknown[]) => {
      listCalls.push({ method, args });
      return builder;
    };
  }
  builder.then = (resolve: (value: unknown) => unknown) =>
    resolve({ data: [ROW], count: 1, error: listError });
  return builder;
};

const fakeClient = () => ({
  from: () => ({
    select: (_columns: string, options?: { head?: boolean }) =>
      options?.head
        ? {
            eq: () => Promise.resolve({ count: 3, error: null }),
          }
        : listBuilder(),
    update: (values: Row) => {
      const entry: { values: Row; id?: unknown } = { values };
      updates.push(entry);
      return {
        eq: (_column: string, id: unknown) => {
          entry.id = id;
          return {
            select: () => ({
              maybeSingle: () => Promise.resolve(updateResult),
            }),
          };
        },
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

const call = async (overrides: Partial<NextApiRequest> = {}) => {
  const req = {
    method: "GET",
    query: {},
    headers: { host: "agostiniandrea.dev" },
    body: undefined,
    ...overrides,
  } as unknown as NextApiRequest;
  const res = makeRes();
  await handler(req, res as unknown as NextApiResponse);
  return res;
};

const patch = (body: unknown, headers: Record<string, string> = {}) =>
  call({
    method: "PATCH",
    body,
    headers: {
      host: "agostiniandrea.dev",
      origin: "https://agostiniandrea.dev",
      "content-type": "application/json",
      ...headers,
    },
  });

const originalEnv = { ...process.env };

beforeEach(() => {
  listCalls = [];
  updates = [];
  listError = null;
  updateResult = { data: { ...ROW, status: "accepted" }, error: null };
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
  jest.spyOn(console, "info").mockImplementation(() => undefined);
});

afterEach(() => {
  process.env = originalEnv;
  jest.restoreAllMocks();
});

describe("admin feedback API", () => {
  it("answers 401 to anyone who is not an admin, before touching the database", async () => {
    mockAuthenticate.mockResolvedValue(null);
    for (const req of [{}, { method: "PATCH" }, { method: "DELETE" }]) {
      const res = await call(req);
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: "Unauthorized" });
    }
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("never lets the answer be cached", async () => {
    const res = await call();
    expect(res.headers["Cache-Control"]).toBe("no-store");
  });

  it("rejects methods other than GET and PATCH", async () => {
    const res = await call({ method: "DELETE" });
    expect(res.statusCode).toBe(405);
  });

  it("lists feedback with totals per status", async () => {
    const res = await call();
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      items: [ROW],
      total: 1,
      page: 1,
      counts: { pending: 3, accepted: 3, rejected: 3, implemented: 3 },
    });
  });

  it("applies only filters that are valid values", async () => {
    await call({
      query: { status: "pending", source: "community", category: "'; drop" },
    });
    const filters = listCalls
      .filter((c) => c.method === "eq")
      .map((c) => c.args);
    expect(filters).toEqual([
      ["status", "pending"],
      ["source", "community"],
    ]);
  });

  it("fails with a generic 500 and no database detail when the query errors", async () => {
    listError = { message: "relation secret_table does not exist" };
    const res = await call();
    expect(res.statusCode).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain("secret_table");
  });

  describe("PATCH", () => {
    it("updates the status and nothing else", async () => {
      const res = await patch({
        id: ID,
        status: "accepted",
        trees_planted: 99,
      });
      expect(res.statusCode).toBe(200);
      expect(updates).toEqual([{ values: { status: "accepted" }, id: ID }]);
    });

    it("rejects an unknown status or a malformed id", async () => {
      expect((await patch({ id: ID, status: "deleted" })).statusCode).toBe(400);
      expect(
        (await patch({ id: "1 or 1=1", status: "accepted" })).statusCode,
      ).toBe(400);
      expect(updates).toHaveLength(0);
    });

    it("rejects a request from another origin or without one", async () => {
      expect(
        (
          await patch(
            { id: ID, status: "accepted" },
            { origin: "https://evil.example" },
          )
        ).statusCode,
      ).toBe(403);
      expect(
        (await patch({ id: ID, status: "accepted" }, { origin: "" }))
          .statusCode,
      ).toBe(403);
      expect(updates).toHaveLength(0);
    });

    it("rejects a body that is not JSON", async () => {
      const res = await patch(
        { id: ID, status: "accepted" },
        { "content-type": "text/plain" },
      );
      expect(res.statusCode).toBe(415);
    });

    it("answers 404 when the row does not exist", async () => {
      updateResult = { data: null, error: null };
      expect((await patch({ id: ID, status: "accepted" })).statusCode).toBe(
        404,
      );
    });
  });
});
