import type { TestProject } from "vitest/node";

import { startServer } from "./helpers/server.js";

export default async function setup(project: TestProject) {
  const { port, server } = await startServer();
  project.provide("port", port);

  return function teardown() {
    return server.close();
  };
}
