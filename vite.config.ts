import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";

// Trial setup: no persistent response store (no R2 / auxiliary Worker), so
// vinext uses its default in-memory cache. Revisit before any production move.
export default defineConfig({
  plugins: [
    vinext({ images: { optimizer: imagesOptimizer() } }),
    cloudflare(),
  ],
});
