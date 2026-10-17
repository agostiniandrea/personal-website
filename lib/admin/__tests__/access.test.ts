import { webcrypto } from "crypto";
import { TextDecoder, TextEncoder } from "util";

import { authenticateAdmin, resetAccessKeyCache } from "../access";

/* A real RSA key pair signs real tokens, and `fetch` serves the matching
   public key as Cloudflare's certs endpoint would. Nothing in the check is
   stubbed: only the network is. */

const TEAM = "andrea.cloudflareaccess.com";
const AUD = "aud-tag-123";
/* The project's jest environment is jsdom, which has neither Web Crypto's
   `subtle` nor TextEncoder. Node's are the same implementation the Worker
   exposes, so the real verification code runs unchanged. */
Object.defineProperty(globalThis, "crypto", {
  configurable: true,
  value: webcrypto,
});
Object.assign(globalThis, { TextDecoder, TextEncoder });
const { subtle } = webcrypto;

const b64url = (input: ArrayBuffer | string): string =>
  Buffer.from(typeof input === "string" ? input : new Uint8Array(input))
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const generate = () =>
  subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  );

type PrivateKey = Awaited<ReturnType<typeof generate>>["privateKey"];

let privateKey: PrivateKey;
let publicJwk: Record<string, unknown>;
let otherPrivateKey: PrivateKey;

const sign = async (
  claims: Record<string, unknown>,
  options: { key?: PrivateKey; kid?: string; alg?: string } = {},
): Promise<string> => {
  const header = b64url(
    JSON.stringify({
      alg: options.alg ?? "RS256",
      kid: options.kid ?? "key-1",
      typ: "JWT",
    }),
  );
  const payload = b64url(JSON.stringify(claims));
  const signature = await subtle.sign(
    "RSASSA-PKCS1-v1_5",
    options.key ?? privateKey,
    new TextEncoder().encode(`${header}.${payload}`),
  );
  return `${header}.${payload}.${b64url(signature)}`;
};

const now = () => Math.floor(Date.now() / 1000);
const validClaims = () => ({
  aud: [AUD],
  email: "andrea@example.com",
  exp: now() + 600,
  iat: now(),
  iss: `https://${TEAM}`,
});
const request = (token?: string) => ({
  headers: token ? { "cf-access-jwt-assertion": token } : {},
});

const mockFetch = jest.fn();
const originalEnv = { ...process.env };

beforeAll(async () => {
  const pair = await generate();
  privateKey = pair.privateKey;
  publicJwk = {
    ...(await subtle.exportKey("jwk", pair.publicKey)),
    kid: "key-1",
  };
  otherPrivateKey = (await generate()).privateKey;
});

beforeEach(() => {
  resetAccessKeyCache();
  mockFetch.mockReset();
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ keys: [publicJwk] }),
  });
  global.fetch = mockFetch as unknown as typeof fetch;
  process.env = {
    ...originalEnv,
    CF_ACCESS_TEAM_DOMAIN: TEAM,
    CF_ACCESS_AUD: AUD,
  };
  delete process.env.ADMIN_DEV_BYPASS;
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  process.env = originalEnv;
  jest.restoreAllMocks();
});

describe("authenticateAdmin", () => {
  it("accepts a valid Cloudflare Access token and returns the email", async () => {
    const identity = await authenticateAdmin(
      request(await sign(validClaims())),
    );
    expect(identity).toEqual({ email: "andrea@example.com" });
    expect(mockFetch).toHaveBeenCalledWith(
      `https://${TEAM}/cdn-cgi/access/certs`,
    );
  });

  it("refuses a request with no token", async () => {
    expect(await authenticateAdmin(request())).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("refuses everything when Access is not configured", async () => {
    delete process.env.CF_ACCESS_AUD;
    expect(
      await authenticateAdmin(request(await sign(validClaims()))),
    ).toBeNull();
    process.env.CF_ACCESS_AUD = AUD;
    delete process.env.CF_ACCESS_TEAM_DOMAIN;
    expect(
      await authenticateAdmin(request(await sign(validClaims()))),
    ).toBeNull();
  });

  it("only ever fetches keys from a cloudflareaccess.com host", async () => {
    process.env.CF_ACCESS_TEAM_DOMAIN = "evil.example.com";
    expect(
      await authenticateAdmin(request(await sign(validClaims()))),
    ).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("refuses a token signed with a different key", async () => {
    const token = await sign(validClaims(), { key: otherPrivateKey });
    expect(await authenticateAdmin(request(token))).toBeNull();
  });

  it("refuses a tampered payload", async () => {
    const token = await sign(validClaims());
    const [header, , signature] = token.split(".");
    const forged = b64url(
      JSON.stringify({ ...validClaims(), email: "attacker@example.com" }),
    );
    expect(
      await authenticateAdmin(request(`${header}.${forged}.${signature}`)),
    ).toBeNull();
  });

  it("refuses the wrong audience, issuer or an expired token", async () => {
    expect(
      await authenticateAdmin(
        request(await sign({ ...validClaims(), aud: ["other"] })),
      ),
    ).toBeNull();
    expect(
      await authenticateAdmin(
        request(
          await sign({
            ...validClaims(),
            iss: "https://evil.cloudflareaccess.com",
          }),
        ),
      ),
    ).toBeNull();
    expect(
      await authenticateAdmin(
        request(await sign({ ...validClaims(), exp: now() - 3600 })),
      ),
    ).toBeNull();
  });

  it("refuses a token that is not RS256 or has no email", async () => {
    expect(
      await authenticateAdmin(
        request(await sign(validClaims(), { alg: "none" })),
      ),
    ).toBeNull();
    const { email, ...noEmail } = validClaims();
    void email;
    expect(await authenticateAdmin(request(await sign(noEmail)))).toBeNull();
  });

  it("refuses garbage without throwing", async () => {
    expect(await authenticateAdmin(request("not-a-jwt"))).toBeNull();
    expect(await authenticateAdmin(request("a.b.c"))).toBeNull();
  });

  it("refreshes the keys once for an unknown kid, then gives up", async () => {
    const token = await sign(validClaims(), { kid: "rotated" });
    expect(await authenticateAdmin(request(token))).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("fails closed when the keys cannot be fetched", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });
    expect(
      await authenticateAdmin(request(await sign(validClaims()))),
    ).toBeNull();
  });

  it("caches the keys between requests", async () => {
    await authenticateAdmin(request(await sign(validClaims())));
    await authenticateAdmin(request(await sign(validClaims())));
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  describe("development bypass", () => {
    it("lets yarn dev through only with the flag and NODE_ENV=development", async () => {
      process.env.ADMIN_DEV_BYPASS = "1";
      (process.env as Record<string, string>).NODE_ENV = "development";
      expect(await authenticateAdmin(request())).toEqual({
        email: "dev@localhost",
      });
    });

    it("never honours the flag outside development", async () => {
      process.env.ADMIN_DEV_BYPASS = "1";
      (process.env as Record<string, string>).NODE_ENV = "production";
      expect(await authenticateAdmin(request())).toBeNull();
      (process.env as Record<string, string>).NODE_ENV = "test";
      expect(await authenticateAdmin(request())).toBeNull();
    });
  });
});
