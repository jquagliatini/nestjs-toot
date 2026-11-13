// oxlint-disable typescript/no-unsafe-declaration-merging
import { Injectable, Module, type DynamicModule } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, it } from "vitest";

import { Config, ConfigModule, InjectConfig } from "./config.module.js";

describe(`Config module`, () => {
  const config = { app: { port: 3_000 } };
  let app: TestingModule;

  type UserConfig = typeof config;
  interface UserProvidedConfig extends UserConfig {}

  @Injectable()
  class UserProvidedConfig {}

  @Injectable()
  class AppService {
    constructor(
      readonly config: Config,

      @InjectConfig() readonly injected: any,

      readonly userConfig: UserProvidedConfig,
    ) {}
  }

  @Injectable()
  @Module({})
  class AppModule {
    static create(config: Config): DynamicModule {
      return {
        module: AppModule,
        providers: [AppService],
        imports: [ConfigModule.forRoot({ config, customToken: UserProvidedConfig })],
      };
    }
  }

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule.create(config)],
    }).compile();
  });

  it(`create a global config object`, async ({ expect }) => {
    const service = app.get(AppService);
    expect((service.config as any).app.port).toBe(config.app.port);
  });

  it(`injects the config`, ({ expect }) => {
    const service = app.get(AppService);
    expect(service.injected.app.port).toBe(config.app.port);
  });

  it(`exposes the custom token`, ({ expect }) => {
    const service = app.get(AppService);
    expect(service.userConfig.app.port).toBe(config.app.port);
  });
});
