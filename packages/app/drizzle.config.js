import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./dist/modules/framework/database/schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: `postgres://postgres:password@localhost:5432/toots` },
});
