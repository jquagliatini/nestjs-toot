import { Injectable } from "@nestjs/common";

import { AuthCommandBus } from "./infrastructure/commands/auth.command-bus.js";

@Injectable()
export class AuthService {
  constructor(private readonly commands: AuthCommandBus) {}

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
  }): Promise<{ token: string; expiresAt: Date }> {
    return this.commands.dispatch.signup(command);
  }

  internalRehydrateToken(bearer: string): Promise<{ id: string }> {
    return this.commands.dispatch.rehydrateToken({ token: bearer });
  }
}
