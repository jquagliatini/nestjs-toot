import { InjectableHandler } from "@jqgl.cc/dispatchable";

import { TootsRepository } from "../toot.repository.js";
import { tootCommands } from "./toots.command-bus.js";

@InjectableHandler(tootCommands.Like)
export class LikeTootCommandHandler {
  constructor(private readonly repository: TootsRepository) {}

  async handle(command: typeof tootCommands.Like.$payload): typeof tootCommands.Like.$result {
    const toot = await this.repository.findById(command.tootId);
    toot.like({ authorId: command.authorId });
    await this.repository.persist(toot);
  }
}
