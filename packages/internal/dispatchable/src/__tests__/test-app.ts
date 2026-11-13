import { Module } from "@nestjs/common";
import { Global, Injectable, NotFoundException } from "@nestjs/common";

import { DispatchableBus } from "../dispatchable.bus.js";
import { InjectableHandler } from "../dispatchable.decorator.js";
import { dispatchables } from "../dispatchable.js";
import { DispatchableModule } from "../dispatchable.module.js";
import { EventEmitterDispatchableTransport } from "../transports/event-emitter.js";

export const userCommands = dispatchables({
  CreateUser: (c) => c.withPayload<{ name: string }>().withResult<{ id: string }>(),
  RenameUser: (c) => c.withPayload<{ id: string; name: string }>().withResult<void>(),
});

export const userQueries = dispatchables({
  __DANGER_NOT_HANDLED: (q) => q.withPayload<{ id: string }>().withResult<void>(),

  DetailsUser: (q) => q.withPayload<{ id: string }>().withResult<{ id: string; name: string }>(),
});

export class AppCommandBus extends DispatchableBus<typeof userCommands> {}
export class AppQueryBus extends DispatchableBus<typeof userQueries> {}

@Injectable()
class Database {
  private readonly db = new Map<string, unknown>();

  set(key: string, value: unknown) {
    this.db.set(key, value);
  }

  get<T = unknown>(key: string): T | undefined {
    return this.db.get(key) as T | undefined;
  }
}

@InjectableHandler(userCommands.CreateUser)
class CreateUserHandler {
  constructor(private readonly db: Database) {}

  async handle(
    command: typeof userCommands.CreateUser.$payload,
  ): typeof userCommands.CreateUser.$result {
    const user = { id: crypto.randomUUID(), name: command.name };
    this.db.set(user.id, user);

    return { id: user.id };
  }
}

@InjectableHandler(userCommands.RenameUser)
class RenameUserHandler {
  constructor(private readonly db: Database) {}

  async handle(
    command: typeof userCommands.RenameUser.$payload,
  ): typeof userCommands.RenameUser.$result {
    const user = this.db.get<{ id: string; name: string }>(command.id);
    if (!user) throw new NotFoundException();

    this.db.set(user.id, { ...user, name: command.name });
  }
}

@InjectableHandler(userQueries.DetailsUser)
class DetailsUserHandler {
  constructor(private readonly db: Database) {}

  async handle(
    query: typeof userQueries.DetailsUser.$payload,
  ): typeof userQueries.DetailsUser.$result {
    const user = this.db.get<{ id: string; name: string }>(query.id);
    if (!user) throw new NotFoundException();

    return user;
  }
}

@Injectable()
export class UserService {
  constructor(
    private readonly commands: AppCommandBus,
    private readonly queries: AppQueryBus,
  ) {}

  createUser(
    command: typeof userCommands.CreateUser.$payload,
  ): typeof userCommands.CreateUser.$result {
    return this.commands.dispatch.CreateUser(command);
  }

  renameUser(
    command: typeof userCommands.RenameUser.$payload,
  ): typeof userCommands.RenameUser.$result {
    return this.commands.dispatch.RenameUser(command);
  }

  detailsUser(
    query: typeof userQueries.DetailsUser.$payload,
  ): typeof userQueries.DetailsUser.$result {
    return this.queries.dispatch.DetailsUser(query);
  }
}

const APP_BUS_TRANSPORT = "APP_BUS_TRANSPORT";
const QUERY_BUS_TRANSPORT = "QUERY_BUS_TRANSPORT";
const COMMAND_BUS_TRANSPORT = "COMMAND_BUS_TRANSPORT";

@Module({
  imports: [
    DispatchableModule.forFeature("userQueries", {
      busInjectionToken: AppQueryBus,
      transport: { provide: QUERY_BUS_TRANSPORT, useExisting: APP_BUS_TRANSPORT },
      dispatchables: userQueries,
    }),
    DispatchableModule.forFeature("userCommands", {
      busInjectionToken: AppCommandBus,
      transport: { provide: COMMAND_BUS_TRANSPORT, useExisting: APP_BUS_TRANSPORT },
      dispatchables: userCommands,
    }),
  ],
  providers: [CreateUserHandler, RenameUserHandler, DetailsUserHandler, UserService],
})
class UserModule {}

@Global()
@Module({
  exports: [Database, APP_BUS_TRANSPORT],
  providers: [
    Database,
    { provide: APP_BUS_TRANSPORT, useClass: EventEmitterDispatchableTransport },
  ],
})
class TransportModule {}

@Module({
  imports: [TransportModule, UserModule],
})
export class AppModule {}
