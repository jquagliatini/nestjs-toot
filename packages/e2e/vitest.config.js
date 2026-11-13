import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    name: { label: "e2e", color: "cyan" },
    globalSetup: ["./src/global-setup.ts"],
  },
});
