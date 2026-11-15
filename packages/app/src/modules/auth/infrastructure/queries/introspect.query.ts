import { InjectableHandler } from "@jqgl.cc/dispatchable";
import { NotFoundException } from "@nestjs/common";

import { Db } from "#/modules/framework/database/schema.js";

import { authQueries } from "./auth.query-bus.js";

@InjectableHandler(authQueries.introspect)
export class IntrospectQueryHandler {
  constructor(private readonly db: Db) {}

  async handle(
    query: typeof authQueries.introspect.$payload,
  ): typeof authQueries.introspect.$result {
    const user = await this.db.tx.query.users.findFirst({
      where: { id: query.userId },
      columns: { id: true, username: true },
    });

    if (!user) throw new NotFoundException();

    return user;
  }
}
