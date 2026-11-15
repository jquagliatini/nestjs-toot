import { InjectableHandler } from "@jqgl.cc/dispatchable";

import { Clock } from "#/modules/framework/clock.js";

import { AuthUser } from "../../domain/auth-user.js";
import { AuthUserRepository } from "../auth-user.repository.js";
import { SessionSigner } from "../session-signer.service.js";
import { authCommands } from "./auth.command-bus.js";

@InjectableHandler(authCommands.signup)
export class SignupCommandHandler {
  constructor(
    private readonly clock: Clock,
    private readonly signer: SessionSigner,
    private readonly repository: AuthUserRepository,
  ) {}

  async handle(command: typeof authCommands.signup.$payload): typeof authCommands.signup.$result {
    const user = await AuthUser.create({
      username: command.username,
      email: command.email,
      password: command.password,
    });

    const session = user.startSession({ now: this.clock.now() });
    await this.repository.persist(user);

    return { ...this.signer.sign(session), id: user.id };
  }
}
