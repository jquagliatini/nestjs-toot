/* oxlint-disable typescript/no-unsafe-declaration-merging */
import {
  Inject,
  Injectable,
  Module,
  type DynamicModule,
  type InjectionToken,
  type Provider,
} from "@nestjs/common";

export interface ConfigRegister {}

/** interface for type merging */
export interface Config {}

@Injectable()
export abstract class Config {}

const CONFIG_TOKEN = Symbol();
export function InjectConfig(): ParameterDecorator {
  return Inject(CONFIG_TOKEN);
}

@Module({})
export class ConfigModule {
  static forRoot<C extends Config>(options: {
    config: C;
    customToken?: InjectionToken;
  }): DynamicModule {
    return {
      global: true,
      module: ConfigModule,
      exports: [CONFIG_TOKEN, Config, ...(options.customToken ? [options.customToken] : [])],
      providers: [
        { provide: CONFIG_TOKEN, useValue: options.config },
        { provide: Config, useExisting: CONFIG_TOKEN },
        ...(options.customToken
          ? [{ provide: options.customToken, useExisting: CONFIG_TOKEN }]
          : []),
      ] as Provider[],
    };
  }
}
