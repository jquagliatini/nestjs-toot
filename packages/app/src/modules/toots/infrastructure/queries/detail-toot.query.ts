import { InjectableHandler } from "@jqgl.cc/dispatchable";
import { Transactional } from "@nestjs-cls/transactional";
import { NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { articleComments, articleLikes, Db } from "#/modules/framework/database/schema.js";
import { paginate } from "#/modules/framework/pagination.js";

import { tootQueries } from "./toot.query-bus.js";

@InjectableHandler(tootQueries.DetailToot)
export class DetailTootQueryHandler {
  constructor(private readonly db: Db) {}

  @Transactional()
  async handle(
    query: typeof tootQueries.DetailToot.$payload,
  ): typeof tootQueries.DetailToot.$result {
    const toot = await this.db.tx.query.articles.findFirst({
      where: { id: query.id },
      columns: {
        id: true,
        createdAt: true,
        content: true,
      },
      extras: {
        likesCount: (t) => this.db.tx.$count(articleLikes, eq(articleLikes.articleId, t.id)),
      },
      with: {
        likes: query.userId ? { where: { authorId: query.userId } } : undefined,
        author: { columns: { id: true, username: true } },
        comments: {
          limit: 10,
          with: { author: { columns: { id: true, username: true } } },
          columns: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    if (!toot) throw new NotFoundException();

    const commentsTotalCount = await this.db.tx.$count(
      articleComments,
      eq(articleComments.articleId, query.id),
    );

    const userLiked = (toot.likes ?? []).some((l) => l.authorId === query.userId);
    return {
      ...toot,
      connectedUser: query.userId
        ? {
            author: toot.author.id === query.userId,
            liked: userLiked,
            permissions: ["comment", userLiked ? "unlike" : "like"] satisfies (
              | "comment"
              | "like"
              | "unlike"
            )[],
          }
        : null,
      comments: paginate({
        items: toot.comments.map((c) => ({
          ...c,
          connectedUser: query.userId ? { author: c.author?.id === query.userId } : null,
        })),
        totalCount: commentsTotalCount,
        pagination: {
          pageIndex: 0,
          pageSize: 10,
          path: `/api/toots/v1/comments`,
        },
      }),
    };
  }
}
