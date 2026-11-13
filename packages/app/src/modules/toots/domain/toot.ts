import { defineMessages } from "@jqgl.cc/messages";

import { IDS } from "#/ids.js";

export class Toot {
  private readonly _messages = defineMessages((h) => ({
    TootCreated: h.withPayload<{ id: string; content: string; authorId: string }>(),
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
}
