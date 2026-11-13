import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: `http://localhost:3000/openapi.json`,
  output: {
    indexFile: false,
    path: "src",
    importFileExtension: ".ts",
    fileName: { suffix: null },
    header: ["/* oxlint-disable */", "// this file is auto-generated"],
  },
  plugins: [
    { name: "@hey-api/typescript" },
    { name: "@hey-api/client-fetch", throwOnError: false },
    {
      name: "@hey-api/sdk",
      transformer: false,

      operations: {
        strategy: "single",
        containerName: { name: "Sdk" },
        nesting(operation) {
          return [operation.tags[0], operation.operationId].filter(Boolean);
        },
        // containerName: { casing: "camelCase" },
      },
    },
  ],
  parser: { pagination: { keywords: [] } },
});
