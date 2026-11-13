type Message<Name extends PropertyKey, Payload> = {
  id: string;
  name: Name;
  payload: Payload;
};

type MessageHelper = {
  withPayload<Payload>(): Payload;
};

type AbstractMessageList = Record<string, unknown>;

type MatchInput<M extends AbstractMessageList> = {
  [K in keyof M]: (payload: M[K]) => unknown;
};

type MatchResult<I extends Record<string, (p: any) => unknown>> =
  Promise<any> extends ReturnType<I[keyof I]>
    ? Promise<Awaited<ReturnType<I[keyof I]>>[]>
    : ReturnType<I[keyof I]>[];

type KnownMessage<I extends AbstractMessageList> = {
  [K in keyof I]: Message<K, I[K]>;
}[keyof I];

// Readable
class MessageCollection<M extends AbstractMessageList> implements Iterable<KnownMessage<M>> {
  readonly $types = {} as unknown as M;

  [Symbol.iterator]() {
    return Iterator.from(this.list);
  }

  constructor(readonly list: Iterable<KnownMessage<M>>) {}

  match<Matches extends MatchInput<M>>(matches: Matches): MatchResult<Matches> {
    let hasPromise = false;
    const results: unknown[] = [];
    for (const message of this) {
      if (!(message.name in matches))
        throw new Error(`no handler defined for "${String(message.name)}"`);

      const result = matches[message.name]?.(message.payload as any);
      hasPromise ||= result instanceof Promise;

      results.push(result);
    }

    return (hasPromise ? Promise.all(results) : results) as any;
  }
}

type Pushable<M extends AbstractMessageList> = {
  [K in keyof M]: (payload: M[K]) => void;
};

// Writable
class MessageQueue<M extends AbstractMessageList> {
  private readonly queue: KnownMessage<M>[] = [];
  readonly push: Pushable<M>;

  constructor(messages: M) {
    const queue = this.queue;
    this.push = new Proxy<Pushable<M>>(messages as any, {
      get(t, p, r) {
        if (!Reflect.has(t, p) || typeof p !== "string") return Reflect.get(t, p, r);
        return (payload: any) => queue.push({ id: crypto.randomUUID(), name: p, payload } as any);
      },
    });
  }

  expose(): MessageCollection<M> {
    return new MessageCollection(this.queue);
  }
}

const messageHelper: MessageHelper = {
  withPayload: <T>(): T => ({}) as T,
};

export function defineMessages<M extends (h: MessageHelper) => AbstractMessageList>(
  messages: M,
): MessageQueue<ReturnType<M>> {
  return new MessageQueue(messages(messageHelper) as any);
}
