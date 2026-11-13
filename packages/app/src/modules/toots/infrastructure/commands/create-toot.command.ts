import { InjectableHandler } from "@jqgl.cc/dispatchable";

import { Toot } from "../../domain/toot.js";
import { TootsRepository } from "../toot.repository.js";
import { tootCommands } from "./toots.command-bus.js";

@InjectableHandler(tootCommands.CreateToot)
export class CreateTootCommandHandler {
  constructor(private readonly repository: TootsRepository) {}

  async handle(
    command: typeof tootCommands.CreateToot.$payload,
  ): typeof tootCommands.CreateToot.$result {
    const toot = Toot.create(command);
    await this.repository.persist(toot);

    return { id: toot.id };
  }
}
