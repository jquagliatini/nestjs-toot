import { InjectableHandler } from "@jqgl.cc/dispatchable";

import { AuthUserRepository } from "../auth-user.repository.js";
import { authCommands } from "./auth.command-bus.js";

@InjectableHandler(authCommands.rehydrateToken)
export class RehydrateTokenCommandHandler {
  constructor(private readonly repository: AuthUserRepository) {}

  async handle({
    token,
  }: typeof authCommands.rehydrateToken.$payload): typeof authCommands.rehydrateToken.$result {
    const user = await this.repository.findByAuthSessionToken(token);
    return { id: user.id };
  }
}
