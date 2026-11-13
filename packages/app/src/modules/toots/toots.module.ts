import { DispatchableModule } from "@jqgl.cc/dispatchable";
import { EventEmitterDispatchableTransport } from "@jqgl.cc/dispatchable/transports/event-emitter";
import { Module } from "@nestjs/common";

import { CreateTootCommandHandler } from "./infrastructure/commands/create-toot.command.js";
import { tootCommands, TootsCommandBus } from "./infrastructure/commands/toots.command-bus.js";
import { TootsRepository } from "./infrastructure/toot.repository.js";
import { TootsController } from "./toots.controller.js";
import { TootsService } from "./toots.service.js";

@Module({
  imports: [
    DispatchableModule.forFeature(`tootCommands`, {
      dispatchables: tootCommands,
      busInjectionToken: TootsCommandBus,
      transport: EventEmitterDispatchableTransport,
    }),
  ],
  controllers: [TootsController],
  providers: [TootsRepository, CreateTootCommandHandler, TootsService],
})
export class TootsModule {}
