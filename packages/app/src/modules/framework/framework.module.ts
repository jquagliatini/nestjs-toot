import { Module, type DynamicModule } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";

import { ClockModule } from "./clock.js";
import { ConfigModule, type UserProvidedConfig } from "./config.js";
import { ContextModule } from "./context.js";
import { DatabaseModule } from "./database/database.module.js";
import { HealthModule } from "./health.js";
import { HttpInstrumentationInterceptor } from "./http-instrumentation.interceptor.js";
import { I18nModule } from "./i18n.js";
import { MetricsModule } from "./metrics.js";

@Module({})
export class FrameworkModule {
  static register(options: { config: UserProvidedConfig }): DynamicModule {
    return {
      module: FrameworkModule,
      global: true,
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: HttpInstrumentationInterceptor,
        },
      ],
      imports: [
        ConfigModule.forRoot(options.config),

        I18nModule,
        ClockModule,
        DatabaseModule,
        ContextModule.register(),

        HealthModule,
        MetricsModule,
      ],
      exports: [ConfigModule, I18nModule, ClockModule, DatabaseModule, ContextModule],
    };
  }
}
