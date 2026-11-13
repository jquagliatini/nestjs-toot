import { type OnModuleInit } from "@nestjs/common";
import { ModuleRef, ModulesContainer } from "@nestjs/core";

import { DISPATCHABLE_HANDLER_META, type DispatchableHandler } from "./dispatchable.decorator.js";
import type { AbstractDispatchable } from "./dispatchable.js";
import type { DispatchableTransport } from "./transport.js";

export class DispatchableDiscover implements OnModuleInit {
  constructor(
    // inject manually in factory
    private readonly container: ModulesContainer,
    private readonly modules: ModuleRef,
    private readonly busId: string,
    private readonly transport: DispatchableTransport,
  ) {}

  onModuleInit() {
    const providers = this.container
      .values()
      .flatMap((x) => x.providers.values())
      .toArray();

    for (const provider of providers) {
      const name = Reflect.getMetadata(
        DISPATCHABLE_HANDLER_META,
        provider.instance?.constructor ?? provider.metatype!,
      );

      if (!name) continue;

      this.transport.register(this.busId, name, (d) => {
        const handler: DispatchableHandler<(p: any) => AbstractDispatchable> = this.modules.get(
          provider.token,
          { strict: false },
        );

        return handler.handle(d.payload);
      });
    }
  }
}
