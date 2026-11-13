import { InjectableHandler } from "@jqgl.cc/dispatchable";
import { Transactional } from "@nestjs-cls/transactional";
import { NotFoundException } from "@nestjs/common";

import { Clock } from "#/modules/framework/clock.js";

import { Email } from "../../domain/email.js";
import { Password } from "../../domain/password.js";
import { AuthUserRepository } from "../auth-user.repository.js";
import { SessionSigner } from "../session-signer.service.js";
import { authCommands } from "./auth.command-bus.js";

@InjectableHandler(authCommands.signin)
export class SigninCommandHandler {
  constructor(
    private readonly clock: Clock,
    private readonly signer: SessionSigner,
    private readonly repository: AuthUserRepository,
  ) {}

  @Transactional()
  async handle(command: typeof authCommands.signin.$payload): typeof authCommands.signin.$result {
    const email = await Email.fromPlain(command.email);
    const user = await this.repository.findByEmail(email);

    if (!user) {
      await Password.timingSafeStubComparison();
      throw new NotFoundException();
    }

    const session = await user.authenticate({
      now: this.clock.now(),
      plainPassword: command.password,
    });

    await this.repository.persist(user);
    return this.signer.sign(session);
  }
}
