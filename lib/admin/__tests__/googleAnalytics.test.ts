import { generateKeyPairSync, verify, webcrypto } from "crypto";
import { TextDecoder, TextEncoder } from "util";

import { getMonthlyAnalytics, resetAnalyticsCache } from "../googleAnalytics";

/* A real RSA key signs the real assertion and the test checks the signature
   with the matching public key. Only the network (Google's token endpoint and
   the Data API) is stubbed. */

/* The project's jest environment is jsdom, which has neither Web Crypto's
   `subtle` nor TextEncoder. Node's are the same implementation the Worker
   exposes. */
Object.defineProperty(globalThis, "crypto", {
  configurable: true,
  value: webcrypto,
});
Object.assign(globalThis, { TextDecoder, TextEncoder });

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const PRIVATE_PEM = privateKey
  .export({ type: "pkcs8", format: "pem" })
  .toString();
const EMAIL = "admin-reader@proj.iam.gserviceaccount.com";
const NOW = new Date("2026-10-17T05:00:00Z");

const mockFetch = jest.fn();

const json = (status: number, body: unknown = {}) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });

const ROWS = [
  {
    dimensionValues: [{ value: "202607" }],
    metricValues: [{ value: "40" }, { value: "55" }, { value: "90" }],
  },
  {
    dimensionValues: [{ value: "202610" }],
    metricValues: [{ value: "12" }, { value: "15" }, { value: "31" }],
  },
];

const serve = (report: () => unknown = () => json(200, { rows: ROWS })) =>
  mockFetch.mockImplementation((url: string) =>
    url.startsWith("https://oauth2.googleapis.com/token")
      ? json(200, { access_token: "tok-1", expires_in: 3600 })
      : report(),
  );

beforeEach(() => {
  resetAnalyticsCache();
  mockFetch.mockReset();
  global.fetch = mockFetch as unknown as typeof fetch;
  process.env.GA4_PROPERTY_ID = "123456789";
  process.env.GA4_SERVICE_ACCOUNT_JSON = JSON.stringify({
    client_email: EMAIL,
    private_key: PRIVATE_PEM,
  });
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  delete process.env.GA4_PROPERTY_ID;
  delete process.env.GA4_SERVICE_ACCOUNT_JSON;
  jest.restoreAllMocks();
});

describe("getMonthlyAnalytics", () => {
  it("reports not_configured, without calling Google, when the secrets are missing", async () => {
    delete process.env.GA4_SERVICE_ACCOUNT_JSON;
    expect(await getMonthlyAnalytics(NOW)).toEqual({
      status: "not_configured",
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns six months, oldest first, with zeros where GA4 has no row", async () => {
    serve();
    const result = await getMonthlyAnalytics(NOW);

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.months.map((month) => month.month)).toEqual([
      "2026-05",
      "2026-06",
      "2026-07",
      "2026-08",
      "2026-09",
      "2026-10",
    ]);
    expect(result.months[2]).toEqual({
      month: "2026-07",
      users: 40,
      sessions: 55,
      pageViews: 90,
    });
    expect(result.months[3]).toEqual({
      month: "2026-08",
      users: 0,
      sessions: 0,
      pageViews: 0,
    });
    expect(result.months[5].users).toBe(12);
  });

  it("asks Google for the report with a bearer token and the right range", async () => {
    serve();
    await getMonthlyAnalytics(NOW);

    const [reportUrl, init] = mockFetch.mock.calls[1] as [
      string,
      { headers: Record<string, string>; body: string },
    ];
    expect(reportUrl).toBe(
      "https://analyticsdata.googleapis.com/v1beta/properties/123456789:runReport",
    );
    expect(init.headers.Authorization).toBe("Bearer tok-1");
    const body = JSON.parse(init.body);
    expect(body.dateRanges).toEqual([
      { startDate: "2026-05-01", endDate: "today" },
    ]);
    expect(body.dimensions).toEqual([{ name: "yearMonth" }]);
  });

  it("signs the token request with the service account's key", async () => {
    serve();
    await getMonthlyAnalytics(NOW);

    const [tokenUrl, init] = mockFetch.mock.calls[0] as [
      string,
      { body: string },
    ];
    expect(tokenUrl).toBe("https://oauth2.googleapis.com/token");
    const params = new URLSearchParams(init.body);
    expect(params.get("grant_type")).toBe(
      "urn:ietf:params:oauth:grant-type:jwt-bearer",
    );
    const [header, claims, signature] = (params.get("assertion") ?? "").split(
      ".",
    );
    const decode = (value: string) =>
      JSON.parse(Buffer.from(value, "base64url").toString());
    expect(decode(header)).toEqual({ alg: "RS256", typ: "JWT" });
    expect(decode(claims)).toMatchObject({
      iss: EMAIL,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
    });
    expect(
      verify(
        "RSA-SHA256",
        Buffer.from(`${header}.${claims}`),
        publicKey,
        Buffer.from(signature, "base64url"),
      ),
    ).toBe(true);
  });

  it("caches the result so a reload does not spend the Data API quota", async () => {
    serve();
    await getMonthlyAnalytics(NOW);
    await getMonthlyAnalytics(NOW);
    expect(mockFetch).toHaveBeenCalledTimes(2); // token + report, once
  });

  it("answers error when Google refuses the report", async () => {
    serve(() => json(403, { error: "forbidden" }));
    expect(await getMonthlyAnalytics(NOW)).toEqual({ status: "error" });
  });

  it("answers error when Google refuses the token", async () => {
    mockFetch.mockImplementation(() => json(400, { error: "invalid_grant" }));
    expect(await getMonthlyAnalytics(NOW)).toEqual({ status: "error" });
  });

  it("does not call Google with a property id that is not digits", async () => {
    process.env.GA4_PROPERTY_ID = "123/../evil";
    expect(await getMonthlyAnalytics(NOW)).toEqual({ status: "error" });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("does not call Google with a key file that is not a service account's", async () => {
    process.env.GA4_SERVICE_ACCOUNT_JSON = JSON.stringify({
      client_email: "someone@example.com",
      private_key: PRIVATE_PEM,
    });
    expect(await getMonthlyAnalytics(NOW)).toEqual({ status: "error" });
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
