import { inspect } from "node:util";

import { InjectableHandler } from "@jqgl.cc/dispatchable";
import { Transactional } from "@nestjs-cls/transactional";
import { Logger } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { articleLikes, articles, Db } from "#/modules/framework/database/schema.js";
import { paginate } from "#/modules/framework/pagination.js";

import { tootQueries } from "./toot.query-bus.js";

@InjectableHandler(tootQueries.ListToots)
export class ListTootsQueryHandler {
  private readonly logger = new Logger(ListTootsQueryHandler.name);

  constructor(private readonly db: Db) {}

  @Transactional()
  async handle(query: typeof tootQueries.ListToots.$payload): typeof tootQueries.ListToots.$result {
    const totalCount = await this.countToots();
    const articleItems = await this.db.tx.query.articles.findMany({
      orderBy: { createdAt: "desc" },
      columns: {
        id: true,
        content: true,
        createdAt: true,
        commentsCount: true,
      },
      extras: {
        likesCount: (t) => this.db.tx.$count(articleLikes, eq(articleLikes.articleId, t.id)),
      },
      with: {
        author: { columns: { id: true, username: true } },
        likes: query.userId ? { where: { authorId: query.userId } } : undefined,
      },
    });

    const items = articleItems.map(({ likes, ...item }) => {
      if (!query.userId) return { ...item, connectedUser: null };

      const userLiked = (likes ?? []).some((l) => l.authorId === query.userId);
      return {
        ...item,
        connectedUser: {
          liked: userLiked,
          author: item.author.id === query.userId,
          permissions: ["comment", userLiked ? "unlike" : "like"] satisfies (
            | "comment"
            | "unlike"
            | "like"
          )[],
        },
      };
    });

    return paginate({ pagination: query.pagination, totalCount, items });
  }

  private async countToots(): Promise<number> {
    const stats = await this.db.tx.query.tootStats
      .findFirst({ columns: { count: true } })
      .catch((err) => {
        this.logger.warn(`error while counting toots ${inspect(err)}`);
        return null;
      });

    if (!stats) {
      return this.db.tx.$count(articles);
    }

    return stats.count;
  }
}
