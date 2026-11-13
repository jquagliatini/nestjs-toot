import assert from "node:assert";

import { AppModule } from "@jqgl.cc/app";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const MIGRATIONS = import.meta.dirname + "/../../../app/drizzle";

type Closable = { close: () => Promise<void> };
export async function startServer(): Promise<{ server: Closable; port: number }> {
  const dbUrl = `postgresql://postgres:password@localhost:5432/toots_tests`;
  const db = drizzle(dbUrl);
  await migrate(db, { migrationsFolder: MIGRATIONS });
  await db.$client.end();

  process.env.TZ = "Etc/UTC";
  const id = crypto.randomUUID();
  const module = await AppModule.create({
    database: { url: dbUrl },
    app: {
      baseUrl: `http://localhost:3000`,
      name: `testing-app-${id}`,
      secret: `secret-d6ac2f8f-be0f-410c-9201-6954894147d6`,
      environment: "development",
      port: 3_000,
    },
  }).catch((err) => {
    console.error(err);
    throw err;
  });

  const server = await module.listen(0, "127.0.0.1");
  const address = server.address();
  assert.ok(typeof address === "object" && address !== null, `no address provided`);

  return { server: module, port: address.port };
}
