import { InjectableHandler } from "@jqgl.cc/dispatchable";
import { Transactional } from "@nestjs-cls/transactional";

import { TootsRepository } from "../toot.repository.js";
import { tootCommands } from "./toots.command-bus.js";

@InjectableHandler(tootCommands.Comment)
export class CommentCommandHandler {
  constructor(private readonly repository: TootsRepository) {}

  @Transactional()
  async handle(command: typeof tootCommands.Comment.$payload): typeof tootCommands.Comment.$result {
    const toot = await this.repository.findById(command.tootId);
    const comment = toot.comment(command);

    await this.repository.persist(toot);
    return { id: comment.id };
  }
}
