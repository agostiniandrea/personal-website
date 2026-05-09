import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [".storybook/vitest.setup.ts"],
    include: ["**/*.stories.@(js|jsx|ts|tsx)"],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});
