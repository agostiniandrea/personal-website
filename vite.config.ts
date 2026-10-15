import { cloudflare } from "@cloudflare/vite-plugin";
import { kvDataAdapter } from "@vinext/cloudflare/cache/kv-data-adapter";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";
import vinext from "vinext";
import { defineConfig } from "vite";

// Trial setup: ISR data cache backed by Workers KV (binding VINEXT_KV_CACHE,
// declared in cloudflare.config.ts). No R2 / response store is used.
export default defineConfig({
  plugins: [
    vinext({
      cache: { data: kvDataAdapter() },
      images: { optimizer: imagesOptimizer() },
    }),
    cloudflare(),
  ],
});
