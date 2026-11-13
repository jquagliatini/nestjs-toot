import { Module, type DynamicModule } from "@nestjs/common";

import { ClockModule } from "./clock.js";
import { ConfigModule, type UserProvidedConfig } from "./config.js";
import { ContextModule } from "./context.js";
import { DatabaseModule } from "./database/database.module.js";
import { HealthModule } from "./health.js";
import { I18nModule } from "./i18n.js";

@Module({})
export class FrameworkModule {
  static register(options: { config: UserProvidedConfig }): DynamicModule {
    return {
      module: FrameworkModule,
      global: true,
      imports: [
        ConfigModule.forRoot(options.config),

        I18nModule,
        ClockModule,
        DatabaseModule,
        ContextModule.register(),

        HealthModule,
      ],
      exports: [ConfigModule, I18nModule, ClockModule, DatabaseModule, ContextModule],
    };
  }
}
