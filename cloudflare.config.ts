import { bindings, defineConfig, defineWorker } from "cf/config";

/**
 * One config, two Workers. `mode` comes from `vinext-cloudflare deploy --env`:
 * no flag means production, `--env staging` builds and deploys the staging
 * Worker. Each Worker has its own name, domain, KV namespace and secrets, so
 * nothing on staging can touch production data stored in Cloudflare.
 */
export default defineConfig(({ mode }) => {
  const isStaging = mode === "staging";

  return {
    worker: defineWorker({
      name: isStaging
        ? "andrea-agostini-website-staging"
        : "andrea-agostini-website",
      entrypoint: "vinext/server/fetch-handler",
      compatibilityDate: "2026-10-13",
      compatibilityFlags: ["nodejs_compat"],
      assets: { notFoundHandling: "none" },
      // Attaching a custom domain needs its DNS record to be free. `www` is not
      // listed here: it is a proxied record plus a Redirect Rule to the apex.
      domains: isStaging ? ["dev.agostiniandrea.dev"] : ["agostiniandrea.dev"],
      env: {
        ASSETS: bindings.assets(),
        IMAGES: bindings.images(),
        // The namespace ID is pinned because saving a secret from the dashboard
        // stores the KV binding with its ID, and the CI deploy (`--strict`)
        // refuses to run when the config has no ID and the remote one does.
        VINEXT_KV_CACHE: bindings.kv({
          id: isStaging
            ? "c7a88536e88e42ecadb493f5eee4b817"
            : "68d5359c9d244994b0ddcdba18131741",
        }),
        // Runtime secrets (server-only). Locally resolved from .dev.vars / .env.local;
        // in production they are set with `cf workers secrets bulk` and never committed.
        SUPABASE_URL: bindings.secret(),
        SUPABASE_SERVICE_ROLE_KEY: bindings.secret(),
        TREE_NATION_API_TOKEN: bindings.secret(),
        // Admin area: the Cloudflare Access team domain and application
        // audience, used to verify the login token (lib/admin/access.ts).
        CF_ACCESS_TEAM_DOMAIN: bindings.secret(),
        CF_ACCESS_AUD: bindings.secret(),
        // Admin overview: Google Analytics numbers read with a service account
        // (lib/admin/googleAnalytics.ts). The JSON key is the secret part.
        GA4_PROPERTY_ID: bindings.secret(),
        GA4_SERVICE_ACCOUNT_JSON: bindings.secret(),
      },
    }),
  };
});
