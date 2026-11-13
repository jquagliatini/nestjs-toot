import type { IncomingMessage } from "node:http";

import { ClsPluginTransactional, TransactionHost } from "@nestjs-cls/transactional";
import { TransactionalAdapterDrizzleOrm } from "@nestjs-cls/transactional-adapter-drizzle-orm";
import { Module, type DynamicModule } from "@nestjs/common";
import { getDrizzleToken } from "@nestjs/drizzle";
import { ClsModule } from "nestjs-cls";

import { Db } from "./database/schema.js";

@Module({})
export class ContextModule {
  static register(): DynamicModule {
    return {
      module: ContextModule,
      exports: [ClsModule, Db],
      global: true,
      providers: [{ provide: Db, useExisting: TransactionHost }],
      imports: [
        ClsModule.forRoot({
          global: true,
          middleware: {
            mount: true,
            generateId: true,
            idGenerator: (req: IncomingMessage): string => {
              let requestId: string | string[] | undefined = req.headers["x-request-id"];
              if (!requestId) return crypto.randomUUID();

              return (Array.isArray(requestId) ? requestId[0] : requestId) ?? crypto.randomUUID();
            },
          },

          plugins: [
            new ClsPluginTransactional({
              adapter: new TransactionalAdapterDrizzleOrm({
                drizzleInstanceToken: getDrizzleToken(),
              }),
            }),
          ],
        }),
      ],
    };
  }
}

declare module "nestjs-cls" {
  interface ClsStore {
    token: string | undefined;
    userId: string | undefined;
  }
}
