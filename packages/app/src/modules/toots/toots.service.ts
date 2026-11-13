import { Injectable } from "@nestjs/common";

import { TootsCommandBus } from "./infrastructure/commands/toots.command-bus.js";

@Injectable()
export class TootsService {
  constructor(private readonly commands: TootsCommandBus) {}

  create(command: { content: string; authorId: string }): Promise<{ id: string }> {
    return this.commands.dispatch.CreateToot(command);
  }
}
