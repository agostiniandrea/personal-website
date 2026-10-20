import type { NextApiRequest, NextApiResponse } from "next";

import handler from "../../../pages/api/admin/analytics";

/* Same approach as the summary API test: a mocked admin check and a mocked
   Google reader. Lives under lib/ because jest's testMatch does not cover
   pages/. */

const mockAuthenticate = jest.fn();
jest.mock("@lib/admin/access", () => ({
  authenticateAdmin: (...args: unknown[]) => mockAuthenticate(...args),
}));

const mockAnalytics = jest.fn();
jest.mock("@lib/admin/googleAnalytics", () => ({
  getMonthlyAnalytics: (...args: unknown[]) => mockAnalytics(...args),
}));

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
    { method, headers: {} } as unknown as NextApiRequest,
    res as unknown as NextApiResponse,
  );
  return res;
};

beforeEach(() => {
  mockAuthenticate.mockReset();
  mockAnalytics.mockReset();
});

describe("GET /api/admin/analytics", () => {
  it("answers 401 and never touches Google for a caller that is not an admin", async () => {
    mockAuthenticate.mockResolvedValue(null);
    const res = await call();

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
    expect(mockAnalytics).not.toHaveBeenCalled();
    expect(res.headers["Cache-Control"]).toBe("no-store");
  });

  it("answers 405 for other methods", async () => {
    mockAuthenticate.mockResolvedValue({ email: "a@example.com" });
    const res = await call("POST");

    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe("GET");
    expect(mockAnalytics).not.toHaveBeenCalled();
  });

  it("returns the numbers for an admin", async () => {
    mockAuthenticate.mockResolvedValue({ email: "a@example.com" });
    const data = { status: "ok", months: [], fetchedAt: "2026-10-17" };
    mockAnalytics.mockResolvedValue(data);
    const res = await call();

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(data);
  });

  it("answers 200 with not_configured when the secrets are not set", async () => {
    mockAuthenticate.mockResolvedValue({ email: "a@example.com" });
    mockAnalytics.mockResolvedValue({ status: "not_configured" });
    const res = await call();

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "not_configured" });
  });

  it("answers 502 when Google fails", async () => {
    mockAuthenticate.mockResolvedValue({ email: "a@example.com" });
    mockAnalytics.mockResolvedValue({ status: "error" });
    const res = await call();

    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({ status: "error" });
  });
});
