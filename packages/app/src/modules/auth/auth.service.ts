import { Injectable } from "@nestjs/common";

import type { AuthIntrospectionDto } from "./infrastructure/auth.dtos.js";
import { AuthCommandBus } from "./infrastructure/commands/auth.command-bus.js";
import { AuthQueryBus } from "./infrastructure/queries/auth.query-bus.js";

@Injectable()
export class AuthService {
  constructor(
    private readonly commands: AuthCommandBus,
    private readonly queries: AuthQueryBus,
  ) {}

  signin(command: {
    email: string;
    password: string;
  }): Promise<{ token: string; expiresAt: Date }> {
    return this.commands.dispatch.signin(command);
  }

  signup(command: {
    email: string;
    password: string;
    username: string;
  }): Promise<{ token: string; expiresAt: Date; id: string }> {
    return this.commands.dispatch.signup(command);
  }

  introspect(userId: string): Promise<AuthIntrospectionDto> {
    return this.queries.dispatch.introspect({ userId });
  }

  internalRehydrateToken(bearer: string): Promise<{ id: string }> {
    return this.commands.dispatch.rehydrateToken({ token: bearer });
  }
}
