import { ConfigModule as InternalConfigModule } from "@jqgl.cc/config";
import { Module, type DynamicModule } from "@nestjs/common";
import z from "zod";

export const configSchema = z.looseObject({
  app: z.object({
    baseUrl: z.url().regex(/[^/]$/),
    secret: z.string().min(12),
    name: z.string().trim().nonempty(),
    port: z.number().int().gte(1_000).optional().default(3_000),
    environment: z.enum(["production", "development"]).optional().default("production"),
  }),
  database: z.object({
    url: z.url({ protocol: /^postgres(ql)?$/ }),
  }),
});

@Module({})
export class ConfigModule {
  static forRoot(userConfig: UserProvidedConfig): DynamicModule {
    const config = configSchema.parse(userConfig);
    return {
      module: ConfigModule,
      imports: [InternalConfigModule.forRoot({ config })],
      exports: [InternalConfigModule],
    };
  }
}

export type UserProvidedConfig = z.input<typeof configSchema>;

declare module "@jqgl.cc/config" {
  type AppConfig = z.output<typeof configSchema>;
  interface Config extends AppConfig {}
}
