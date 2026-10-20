import {
  AdminAnalytics,
  AdminAnalyticsMonth,
  ANALYTICS_MONTHS,
} from "./analyticsAdmin";

/* Reads monthly numbers from the GA4 Data API with a service account.
 *
 * The service account is a robot user that only has the Viewer role on the
 * property. Its JSON key is a Worker secret (GA4_SERVICE_ACCOUNT_JSON) and is
 * used here and nowhere else: this module signs a short-lived JWT with it (plain
 * Web Crypto, so it runs unchanged in the Worker and in Node), trades it for an
 * access token and calls `runReport`. The key never reaches the browser.
 *
 * Results are cached in memory for a few minutes: the Data API has a daily
 * quota and the numbers move slowly. Every failure ends in a status the card
 * can explain, never in a thrown error.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const REPORT_URL = (propertyId: string) =>
  `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

const CACHE_TTL_MS = 15 * 60 * 1000;
/* Refresh the access token a minute before Google says it expires. */
const TOKEN_MARGIN_MS = 60 * 1000;

interface ServiceAccount {
  clientEmail: string;
  privateKey: string;
}

let tokenCache: { token: string; expiresAt: number } | null = null;
let reportCache: { data: AdminAnalytics; fetchedAt: number } | null = null;

/** Test hook: forget the cached token and report. */
export function resetAnalyticsCache(): void {
  tokenCache = null;
  reportCache = null;
}

const base64Url = (input: string | Uint8Array): string => {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

const pemToDer = (pem: string): Uint8Array => {
  const body = pem
    .replace(/-----BEGIN [A-Z ]+-----/, "")
    .replace(/-----END [A-Z ]+-----/, "")
    .replace(/\s+/g, "");
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

/* Both values come from configuration but end up in a URL and a token request,
   so they are held to the one shape Google uses. */
function readConfig():
  { propertyId: string; account: ServiceAccount } | "missing" | "invalid" {
  const rawProperty = process.env.GA4_PROPERTY_ID?.trim();
  const rawJson = process.env.GA4_SERVICE_ACCOUNT_JSON?.trim();
  if (!rawProperty || !rawJson) return "missing";

  const propertyId = rawProperty.replace(/^properties\//, "");
  if (!/^\d{4,15}$/.test(propertyId)) return "invalid";

  try {
    const parsed = JSON.parse(rawJson) as {
      client_email?: unknown;
      private_key?: unknown;
    };
    if (
      typeof parsed.client_email !== "string" ||
      typeof parsed.private_key !== "string" ||
      !parsed.client_email.endsWith(".iam.gserviceaccount.com") ||
      !parsed.private_key.includes("PRIVATE KEY")
    ) {
      return "invalid";
    }
    return {
      propertyId,
      account: {
        clientEmail: parsed.client_email,
        privateKey: parsed.private_key,
      },
    };
  } catch {
    return "invalid";
  }
}

async function signAssertion(account: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64Url(
    JSON.stringify({
      iss: account.clientEmail,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(account.privateKey) as Parameters<
      typeof crypto.subtle.importKey
    >[1],
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(`${header}.${claims}`),
  );
  return `${header}.${claims}.${base64Url(new Uint8Array(signature))}`;
}

async function getAccessToken(account: ServiceAccount): Promise<string> {
  if (tokenCache && tokenCache.expiresAt - TOKEN_MARGIN_MS > Date.now()) {
    return tokenCache.token;
  }
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: await signAssertion(account),
    }).toString(),
  });
  if (!response.ok) throw new Error(`Google token (${response.status})`);
  const body = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!body.access_token) throw new Error("Google token missing");
  tokenCache = {
    token: body.access_token,
    expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000,
  };
  return body.access_token;
}

/* "2026-10" for the calendar month `offset` months before `from` (UTC). */
const monthKey = (from: Date, offset: number): string => {
  const date = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth() - offset, 1),
  );
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
};

interface ReportRow {
  dimensionValues?: { value?: string }[];
  metricValues?: { value?: string }[];
}

async function fetchMonths(
  propertyId: string,
  account: ServiceAccount,
  now: Date,
): Promise<AdminAnalyticsMonth[]> {
  const first = monthKey(now, ANALYTICS_MONTHS - 1);
  const response = await fetch(REPORT_URL(propertyId), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await getAccessToken(account)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: `${first}-01`, endDate: "today" }],
      dimensions: [{ name: "yearMonth" }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
      ],
      orderBys: [{ dimension: { dimensionName: "yearMonth" } }],
    }),
  });
  if (!response.ok) throw new Error(`GA4 report (${response.status})`);

  const body = (await response.json()) as { rows?: ReportRow[] };
  const byMonth = new Map<string, AdminAnalyticsMonth>();
  (body.rows ?? []).forEach((row) => {
    const raw = row.dimensionValues?.[0]?.value ?? "";
    if (!/^\d{6}$/.test(raw)) return;
    const month = `${raw.slice(0, 4)}-${raw.slice(4)}`;
    const metric = (index: number) =>
      Number(row.metricValues?.[index]?.value) || 0;
    byMonth.set(month, {
      month,
      users: metric(0),
      sessions: metric(1),
      pageViews: metric(2),
    });
  });

  /* Always the same six months, oldest first, with zeros where GA4 has no row
     (a month with no visits is absent from the report). */
  return Array.from({ length: ANALYTICS_MONTHS }, (_, index) => {
    const month = monthKey(now, ANALYTICS_MONTHS - 1 - index);
    return byMonth.get(month) ?? { month, users: 0, sessions: 0, pageViews: 0 };
  });
}

export async function getMonthlyAnalytics(
  now: Date = new Date(),
): Promise<AdminAnalytics> {
  if (reportCache && Date.now() - reportCache.fetchedAt < CACHE_TTL_MS) {
    return reportCache.data;
  }

  const config = readConfig();
  if (config === "missing") return { status: "not_configured" };
  if (config === "invalid") {
    console.error("Admin analytics: GA4 configuration is not valid");
    return { status: "error" };
  }

  try {
    const months = await fetchMonths(config.propertyId, config.account, now);
    const data: AdminAnalytics = {
      status: "ok",
      months,
      fetchedAt: new Date().toISOString(),
    };
    reportCache = { data, fetchedAt: Date.now() };
    return data;
  } catch (error) {
    console.error(
      "Admin analytics request failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    return { status: "error" };
  }
}
