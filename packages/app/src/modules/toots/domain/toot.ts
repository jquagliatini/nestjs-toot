import type { Id } from "@jqgl.cc/humanid";
import { defineMessages } from "@jqgl.cc/messages";
import { z } from "zod";

import { IDS } from "#/ids.js";
import { InvalidInputException } from "#/modules/framework/errors.js";

export class Toot {
  private readonly _messages = defineMessages((h) => ({
    TootCreated: h.withPayload<{ id: string; content: string; authorId: string }>(),
    Comment: h.withPayload<{ id: string; comment: Comment }>(),
    Like: h.withPayload<{ id: string; authorId: string }>(),
    Unlike: h.withPayload<{ id: string; authorId: string }>(),
  }));

  static from(props: { id: string }): Toot {
    return new Toot(IDS.toots.toot(props.id));
  }

  get messages() {
    return this._messages.expose();
  }

  private constructor(readonly id = IDS.toots.toot()) {}

  static create(props: { content: string; authorId: string }): Toot {
    const toot = new Toot();
    toot._messages.push.TootCreated({ ...props, id: toot.id });

    return toot;
  }

  comment(command: { content: string; authorId: string }): { id: Id<"toots/comment"> } {
    const comment = Comment.create(command);
    this._messages.push.Comment({ id: this.id, comment });

    return comment;
  }

  like(command: { authorId: string }): void {
    this._messages.push.Like({ id: this.id, authorId: command.authorId });
  }

  unlike(command: { authorId: string }): void {
    this._messages.push.Unlike({ id: this.id, authorId: command.authorId });
  }
}

export const InvalidComment = InvalidInputException(`toots.errors.emptyComment`);
export class Comment {
  constructor(
    readonly content: string,
    readonly authorId: Id<"auth/user">,
    readonly id = IDS.toots.comment(),
  ) {}

  static create(props: { content: string; authorId: string }): Comment {
    const content = z
      .string()
      .trim()
      .nonempty()
      .parse(props.content, { error: () => new InvalidComment() });

    return new Comment(content, IDS.auth.user(props.authorId));
  }
}
