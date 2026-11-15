import { DispatchableModule } from "@jqgl.cc/dispatchable";
import { EventEmitterDispatchableTransport } from "@jqgl.cc/dispatchable/transports/event-emitter";
import { Module } from "@nestjs/common";

import { CommentCommandHandler } from "./infrastructure/commands/comment.command.js";
import { CreateTootCommandHandler } from "./infrastructure/commands/create-toot.command.js";
import { LikeTootCommandHandler } from "./infrastructure/commands/like.command.js";
import { tootCommands, TootsCommandBus } from "./infrastructure/commands/toots.command-bus.js";
import { UnlikeTootCommandHandler } from "./infrastructure/commands/unlike.command.js";
import { DetailTootQueryHandler } from "./infrastructure/queries/detail-toot.query.js";
import { ListCommentsQueryHandler } from "./infrastructure/queries/list-comments.query.js";
import { ListTootsQueryHandler } from "./infrastructure/queries/list-toots.query.js";
import { tootQueries, TootsQueryBus } from "./infrastructure/queries/toot.query-bus.js";
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
    DispatchableModule.forFeature(`tootQueries`, {
      dispatchables: tootQueries,
      busInjectionToken: TootsQueryBus,
      transport: EventEmitterDispatchableTransport,
    }),
  ],
  controllers: [TootsController],
  providers: [
    TootsRepository,
    CommentCommandHandler,
    CreateTootCommandHandler,
    DetailTootQueryHandler,
    ListTootsQueryHandler,
    ListCommentsQueryHandler,
    UnlikeTootCommandHandler,
    LikeTootCommandHandler,
    TootsService,
  ],
})
export class TootsModule {}
