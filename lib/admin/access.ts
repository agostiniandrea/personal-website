/* Admin access control.
 *
 * The admin area sits behind Cloudflare Access, which signs every request it
 * lets through with a JWT (header `Cf-Access-Jwt-Assertion`). Access is the
 * login; this file is the second lock. The admin API uses the Supabase service
 * key, which bypasses every database rule, so it must not rely on the edge
 * being configured correctly: it verifies the token itself and refuses
 * everything else. If Access is ever switched off, misrouted or bypassed, the
 * API still answers 401.
 *
 * Verification is plain Web Crypto (RS256 against Cloudflare's published
 * keys), so it runs unchanged in the Worker and in Node. Fail closed: missing
 * configuration, an unknown key, a wrong audience or issuer, an expired token
 * or a malformed one all end in `null`.
 */

export interface AdminIdentity {
  email: string;
}

interface HeaderBag {
  headers: Record<string, string | string[] | undefined>;
}

interface Jwk {
  kid?: string;
  [field: string]: unknown;
}

const JWKS_TTL_MS = 10 * 60 * 1000;
/* Seconds of clock drift tolerated on exp / nbf. */
const CLOCK_SKEW_S = 30;

let jwksCache: { host: string; keys: Jwk[]; fetchedAt: number } | null = null;

/** Test hook: forget cached keys. */
export function resetAccessKeyCache(): void {
  jwksCache = null;
}

/* The team domain comes from configuration, but it is also the host this code
   fetches keys from, so it is held to the one shape Cloudflare uses. */
function normalizeTeamHost(raw: string | undefined): string | null {
  if (!raw) return null;
  const host = raw
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "")
    .toLowerCase();
  return /^[a-z0-9-]+\.cloudflareaccess\.com$/.test(host) ? host : null;
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function decodeJson<T>(value: string): T | null {
  try {
    return JSON.parse(new TextDecoder().decode(base64UrlToBytes(value))) as T;
  } catch {
    return null;
  }
}

async function loadKeys(host: string, forceRefresh: boolean): Promise<Jwk[]> {
  const now = Date.now();
  if (
    !forceRefresh &&
    jwksCache &&
    jwksCache.host === host &&
    now - jwksCache.fetchedAt < JWKS_TTL_MS
  ) {
    return jwksCache.keys;
  }

  const response = await fetch(`https://${host}/cdn-cgi/access/certs`);
  if (!response.ok) {
    throw new Error(`Access keys unavailable (${response.status})`);
  }
  const body = (await response.json()) as { keys?: Jwk[] };
  const keys = Array.isArray(body.keys) ? body.keys : [];
  jwksCache = { host, keys, fetchedAt: now };
  return keys;
}

function readHeader(req: HeaderBag, name: string): string | null {
  const value = req.headers[name];
  const single = Array.isArray(value) ? value[0] : value;
  return typeof single === "string" && single.trim() ? single.trim() : null;
}

interface AccessClaims {
  aud?: string | string[];
  email?: string;
  exp?: number;
  iss?: string;
  nbf?: number;
}

async function verifyAccessJwt(
  token: string,
  host: string,
  audience: string,
): Promise<AccessClaims | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  const header = decodeJson<{ alg?: string; kid?: string }>(encodedHeader);
  const claims = decodeJson<AccessClaims>(encodedPayload);
  if (!header || !claims || header.alg !== "RS256" || !header.kid) return null;

  let keys = await loadKeys(host, false);
  let jwk = keys.find((key) => key.kid === header.kid);
  if (!jwk) {
    /* Cloudflare rotates its keys: one refresh for an unknown kid, no more. */
    keys = await loadKeys(host, true);
    jwk = keys.find((key) => key.kid === header.kid);
  }
  if (!jwk) return null;

  const key = await crypto.subtle.importKey(
    "jwk",
    /* The published keys are plain JWKs; the DOM type for one is not nameable
       here without a global, so the cast goes through `never`. */
    jwk as never,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    base64UrlToBytes(encodedSignature) as Parameters<
      typeof crypto.subtle.verify
    >[3],
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
  );
  if (!valid) return null;

  const now = Math.floor(Date.now() / 1000);
  if (claims.iss !== `https://${host}`) return null;
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!audiences.includes(audience)) return null;
  if (typeof claims.exp !== "number" || claims.exp + CLOCK_SKEW_S < now) {
    return null;
  }
  if (typeof claims.nbf === "number" && claims.nbf - CLOCK_SKEW_S > now) {
    return null;
  }
  return claims;
}

/**
 * Returns who is calling, or `null` when the request is not an admin's.
 *
 * `ADMIN_DEV_BYPASS=1` lets `yarn dev` through with a placeholder identity
 * (there is no Cloudflare in front of localhost). It only works when
 * NODE_ENV is "development": a production or staging build never honours it,
 * whatever the variable says.
 */
export async function authenticateAdmin(
  req: HeaderBag,
): Promise<AdminIdentity | null> {
  if (
    process.env.NODE_ENV === "development" &&
    process.env.ADMIN_DEV_BYPASS === "1"
  ) {
    return { email: "dev@localhost" };
  }

  const host = normalizeTeamHost(process.env.CF_ACCESS_TEAM_DOMAIN);
  const audience = process.env.CF_ACCESS_AUD?.trim();
  const token = readHeader(req, "cf-access-jwt-assertion");
  if (!host || !audience || !token) return null;

  try {
    const claims = await verifyAccessJwt(token, host, audience);
    if (!claims?.email || typeof claims.email !== "string") return null;
    return { email: claims.email };
  } catch (error) {
    console.error(
      "Admin access check failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    return null;
  }
}
