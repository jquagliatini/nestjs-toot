import { Module, type DynamicModule, type InjectionToken, type Provider } from "@nestjs/common";
import { ModuleRef, ModulesContainer } from "@nestjs/core";

import { DispatchableBus } from "./dispatchable.bus.js";
import { DispatchableDiscover } from "./dispatchable.discover.js";
import type { AbstractDispatchable } from "./dispatchable.js";
import type { DispatchableTransport } from "./transport.js";

@Module({})
export class DispatchableModule {
  static forFeature(
    featureName: string,
    options: {
      busInjectionToken: InjectionToken;
      transport: Provider<DispatchableTransport>;
      dispatchables: Record<string, (p: any) => AbstractDispatchable>;
    },
  ): DynamicModule {
    const transportToken: InjectionToken =
      typeof options.transport === "function" ? options.transport : options.transport.provide;

    return {
      module: DispatchableModule,
      exports: [options.busInjectionToken],
      providers: [
        options.transport,
        {
          provide: options.busInjectionToken,
          inject: [transportToken],
          useFactory: async (transport: DispatchableTransport) => {
            // TODO: should we open with nest?
            await transport.open();

            return DispatchableBus.build({
              transport,
              featureName,
              dispatchables: options.dispatchables,
            });
          },
        },
        {
          provide: DispatchableDiscover,
          inject: [ModulesContainer, ModuleRef, transportToken],
          useFactory: (
            container: ModulesContainer,
            modules: ModuleRef,
            transport: DispatchableTransport,
          ) => new DispatchableDiscover(container, modules, featureName, transport),
        },
      ],
    };
  }
}
