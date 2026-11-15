import { InjectableHandler } from "@jqgl.cc/dispatchable";
import { Transactional } from "@nestjs-cls/transactional";
import { eq } from "drizzle-orm";

import { articleComments, Db } from "#/modules/framework/database/schema.js";
import { paginate } from "#/modules/framework/pagination.js";

import { tootQueries } from "./toot.query-bus.js";

@InjectableHandler(tootQueries.ListComments)
export class ListCommentsQueryHandler {
  constructor(private readonly db: Db) {}

  @Transactional()
  async handle(
    payload: typeof tootQueries.ListComments.$payload,
  ): typeof tootQueries.ListComments.$result {
    const items = await this.db.tx.query.articleComments.findMany({
      where: { articleId: payload.tootId },
      limit: payload.pagination.pageSize,
      offset: payload.pagination.pageIndex * payload.pagination.pageSize,
      with: { author: { columns: { id: true, username: true } } },
      columns: {
        id: true,
        createdAt: true,
        content: true,
      },
    });

    const totalCount = await this.db.tx.$count(
      articleComments,
      eq(articleComments.articleId, payload.tootId),
    );

    return paginate({ items, totalCount, pagination: payload.pagination });
  }
}
