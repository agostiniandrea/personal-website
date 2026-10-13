import { bindings, defineConfig, defineWorker } from "cf/config";
import { createWorkersResponseStoreServiceBindingConfig } from "@vinext/cloudflare/cache/config";

const responseStore = await createWorkersResponseStoreServiceBindingConfig({
  worker: {
    name: "andrea-agostini-website-response-store",
    compatibilityDate: "2026-10-13",
    compatibilityFlags: ["nodejs_compat"],
  },
  bucket: "andrea-agostini-website-response-store-cache-bodies",
});

export const responseStoreServiceBinding = responseStore.serviceBindingWorker;

export default defineConfig({
  worker: defineWorker({
    ...responseStore.applicationWorker,
    name: "andrea-agostini-website",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-10-13",
    compatibilityFlags: ["nodejs_compat"],
    assets: { notFoundHandling: "none" },
    env: {
      ...responseStore.applicationWorker.env,
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      // Runtime secrets (server-only). Locally resolved from .dev.vars / .env.local;
      // in production they are set with `cf secret put` and never committed.
      SUPABASE_URL: bindings.secret(),
      SUPABASE_SERVICE_ROLE_KEY: bindings.secret(),
      TREE_NATION_API_TOKEN: bindings.secret(),
    },
  }),
});
