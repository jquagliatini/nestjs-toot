import { Injectable, Module } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { expectTypeOf, test } from "vitest";

import { ConfigModule, Config } from "./config.module.js";

const config = { app: { port: 3_000 } };
declare module "./config.module.js" {
  type AppConfig = typeof config;
  interface Config extends AppConfig {}
}

@Injectable()
class AppService {
  constructor(readonly config: Config) {}
}

@Module({ providers: [AppService], imports: [ConfigModule.forRoot({ config })] })
class AppModule {}

test(`augments type`, async () => {
  const app = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  expectTypeOf(app.get(AppService).config).toExtend<typeof config>();
});
