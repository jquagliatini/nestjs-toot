import { InjectableHandler } from "@jqgl.cc/dispatchable";

import { TootsRepository } from "../toot.repository.js";
import { tootCommands } from "./toots.command-bus.js";

@InjectableHandler(tootCommands.Unlike)
export class UnlikeTootCommandHandler {
  constructor(private readonly repository: TootsRepository) {}

  async handle(command: typeof tootCommands.Unlike.$payload): typeof tootCommands.Unlike.$result {
    const toot = await this.repository.findById(command.tootId);
    toot.unlike({ authorId: command.authorId });
    await this.repository.persist(toot);
  }
}
