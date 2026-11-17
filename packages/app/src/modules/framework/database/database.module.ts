import { Config } from "@jqgl.cc/config";
import { instrumentDrizzleClient } from "@kubiks/otel-drizzle";
import { Module } from "@nestjs/common";
import { DrizzleModule, type DrizzleModuleFactoryOptions } from "@nestjs/drizzle";
import { drizzle } from "drizzle-orm/node-postgres";

import { relations } from "./schema.js";

@Module({
  exports: [DrizzleModule],
  imports: [
    DrizzleModule.forRootAsync({
      inject: [Config],
      useFactory: (config: Config): DrizzleModuleFactoryOptions => ({
        relations,
        autoCloseConnection: true,
        connection: config.database.url,
        drizzle: (...args: Parameters<typeof drizzle>) => {
          const { pathname: dbName, port } = new URL(config.database.url);

          return instrumentDrizzleClient(drizzle(...args), {
            dbName,
            peerPort: Number(port),
            dbSystem: `postgresql`,
          });
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
