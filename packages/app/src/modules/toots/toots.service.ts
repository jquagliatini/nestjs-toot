import { Injectable } from "@nestjs/common";

import type { Pagination } from "../framework/pagination.js";
import { TootsCommandBus } from "./infrastructure/commands/toots.command-bus.js";
import { TootsQueryBus } from "./infrastructure/queries/toot.query-bus.js";
import type { DetailedTootDto, ListedCommentsDto, ListedTootsDto } from "./toots.dto.js";

@Injectable()
export class TootsService {
  constructor(
    private readonly commands: TootsCommandBus,
    private readonly queries: TootsQueryBus,
  ) {}

  create(command: { content: string; authorId: string }): Promise<{ id: string }> {
    return this.commands.dispatch.CreateToot(command);
  }

  list(query: { pagination: Pagination; userId: string | null }): Promise<ListedTootsDto> {
    return this.queries.dispatch.ListToots(query);
  }

  detail(query: { id: string; userId: string | null }): Promise<DetailedTootDto> {
    return this.queries.dispatch.DetailToot(query);
  }

  comment(command: { tootId: string; content: string; authorId: string }): Promise<{ id: string }> {
    return this.commands.dispatch.Comment(command);
  }

  listComments(query: { tootId: string; pagination: Pagination }): Promise<ListedCommentsDto> {
    return this.queries.dispatch.ListComments(query);
  }

  like(command: { tootId: string; authorId: string }): Promise<void> {
    return this.commands.dispatch.Like(command);
  }

  unlike(command: { tootId: string; authorId: string }): Promise<void> {
    return this.commands.dispatch.Unlike(command);
  }
}
