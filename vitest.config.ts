import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [".storybook/vitest.setup.ts"],
    include: ["**/*.stories.@(js|jsx|ts|tsx)"],
    browser: {
      enabled: true,
      headless: true,
      name: "chromium",
      provider: "playwright",
    },
  },
});
