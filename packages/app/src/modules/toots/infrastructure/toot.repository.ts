import { Transactional } from "@nestjs-cls/transactional";
import { Injectable, NotFoundException } from "@nestjs/common";

import { articles, Db } from "#/modules/framework/database/schema.js";

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
    });
  }

  private async persistTootCreated({ authorId, content }: TootCreated): Promise<void> {
    await this.db.tx.insert(articles).values({ authorId, content });
  }
}

type TootCreated = Toot["messages"]["$types"]["TootCreated"];
