import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["./packages/internal/*", "./packages/app", "./packages/e2e"],
  },
});
