import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "andrea-agostini-website",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-10-13",
    compatibilityFlags: ["nodejs_compat"],
    assets: { notFoundHandling: "none" },
    // Production apex plus the trial hostname. Attaching the apex needs its DNS
    // record to be free: delete the CNAME that points to Vercel right before the
    // deploy that ships this line.
    domains: ["agostiniandrea.dev", "test.agostiniandrea.dev"],
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      VINEXT_KV_CACHE: bindings.kv(),
      // Runtime secrets (server-only). Locally resolved from .dev.vars / .env.local;
      // in production they are set with `cf workers secrets bulk` and never committed.
      SUPABASE_URL: bindings.secret(),
      SUPABASE_SERVICE_ROLE_KEY: bindings.secret(),
      TREE_NATION_API_TOKEN: bindings.secret(),
    },
  }),
});
