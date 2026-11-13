import type { Server } from "node:http";

import { Config } from "@jqgl.cc/config";
import { Logger, Module, StandardSchemaValidationPipe, type DynamicModule } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { type NestNodeApplication, NodeAdapter } from "@nestjs/platform-node";

import { ApplicationModule } from "./modules/application.module.js";
import type { UserProvidedConfig } from "./modules/framework/config.js";
import { FrameworkModule } from "./modules/framework/framework.module.js";
import { withOpenApi } from "./modules/framework/openapi.js";

@Module({})
export class AppModule {
  static register(options: { config: UserProvidedConfig }): DynamicModule {
    return {
      module: AppModule,
      imports: [FrameworkModule.register(options), ApplicationModule],
    };
  }

  static async create(config: UserProvidedConfig): Promise<NestNodeApplication<Server>> {
    const app = await NestFactory.create<NestNodeApplication<Server>>(
      AppModule.register({ config }),
      new NodeAdapter(),
      { routeConflictPolicy: { duplicate: "error", shadow: "error" } },
    );

    return withOpenApi(
      app.enableShutdownHooks().useGlobalPipes(new StandardSchemaValidationPipe()),
    );
  }

  static async listen(config: UserProvidedConfig): Promise<void> {
    const app = await this.create(config);
    await app.listen(app.get(Config).app.port);

    new Logger(AppModule.name).log(`server started on ${app.getHttpServer().address()}`);
  }
}
