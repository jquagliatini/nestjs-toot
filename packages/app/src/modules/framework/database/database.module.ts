import { Config } from "@jqgl.cc/config";
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
        drizzle,
        relations,
        autoCloseConnection: true,
        connection: config.database.url,
      }),
    }),
  ],
})
export class DatabaseModule {}
