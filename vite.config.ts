import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";
import { kvDataAdapter } from "@vinext/cloudflare/cache/kv-data-adapter";

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
