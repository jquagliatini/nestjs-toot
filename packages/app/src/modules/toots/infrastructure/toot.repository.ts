import { Transactional } from "@nestjs-cls/transactional";
import { Injectable, NotFoundException } from "@nestjs/common";
import { and, eq, sql } from "drizzle-orm";

import {
  articleComments,
  articleLikes,
  articles,
  Db,
} from "#/modules/framework/database/schema.js";

import { Toot } from "../domain/toot.js";

@Injectable()
export class TootsRepository {
  constructor(private readonly db: Db) {}

  async findById(id: string): Promise<Toot> {
    const toot = await this.db.tx.query.articles.findFirst({
      where: { id },
      columns: { id: true },
    });

    if (!toot) throw new NotFoundException();

    return Toot.from({ id });
  }

  @Transactional()
  async persist(toot: Toot): Promise<void> {
    await toot.messages.match({
      TootCreated: (m) => this.persistTootCreated(m),
      Comment: (m) => this.persistComment(m),
      Like: (m) => this.like(m),
      Unlike: (m) => this.unlike(m),
    });
  }

  private async persistTootCreated({ id, authorId, content }: TootCreated): Promise<void> {
    await this.db.tx.insert(articles).values({ id, authorId, content });
  }

  private async persistComment({ comment, id }: TootCommented): Promise<void> {
    await this.db.tx.insert(articleComments).values({
      articleId: id,
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
    });
    await this.db.tx
      .update(articles)
      .set({ commentsCount: sql`${articles.commentsCount} + 1` })
      .where(eq(articles.id, id));
  }

  private async like({ id, authorId }: TootLiked): Promise<void> {
    const likeExists = await this.db.tx.query.articleLikes.findFirst({
      where: { articleId: id, authorId },
    });

    if (likeExists) return;

    await this.db.tx.insert(articleLikes).values({
      articleId: id,
      authorId,
    });

    await this.db.tx
      .update(articles)
      .set({ likesCount: sql`${articles.likesCount} + 1` })
      .where(eq(articles.id, id));
  }

  private async unlike({ id, authorId }: TootUnLiked): Promise<void> {
    const likeExists = await this.db.tx.query.articleLikes.findFirst({
      where: { articleId: id, authorId },
    });

    if (!likeExists) return;

    await this.db.tx
      .delete(articleLikes)
      .where(and(eq(articleLikes.articleId, id), eq(articleLikes.authorId, authorId)));

    await this.db.tx
      .update(articles)
      .set({ likesCount: sql`${articles.likesCount} - 1` })
      .where(eq(articles.id, id));
  }
}

type TootCreated = Toot["messages"]["$types"]["TootCreated"];
type TootCommented = Toot["messages"]["$types"]["Comment"];
type TootLiked = Toot["messages"]["$types"]["Like"];
type TootUnLiked = Toot["messages"]["$types"]["Unlike"];
