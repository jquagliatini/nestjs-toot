import { describe, expectTypeOf, it, vi } from "vitest";

import { defineMessages } from "./messages.js";

describe(`defineMessages`, () => {
  it(`defines a message queue`, ({ expect }) => {
    const queue = defineMessages((h) => ({
      UserCreated: h.withPayload<{ id: string; name: string }>(),
      UserRenames: h.withPayload<{ id: string; name: string }>(),
    }));
    queue.push.UserCreated({ id: `usr-1`, name: `John` });

    expect(Array.from(queue.expose())).toEqual([
      { id: expect.any(String), name: `UserCreated`, payload: { id: `usr-1`, name: `John` } },
    ]);
  });

  it(`allows to match on all messages`, ({ expect }) => {
    const queue = defineMessages((h) => ({
      UserCreated: h.withPayload<{ id: string; name: string }>(),
      UserRenamed: h.withPayload<{ id: string; name: string }>(),
    }));
    queue.push.UserCreated({ id: `usr-1`, name: `John` });

    const result = queue.expose().match({
      UserCreated: ({ id, name }) => ({ type: `UserCreated` as const, id, name }),
      UserRenamed: ({ id, name }) => ({ type: `UserRenamed` as const, id, name }),
    });

    expect(result).toEqual([{ type: `UserCreated`, id: `usr-1`, name: `John` }]);
  });

  it(`iterates on exposed messages`, ({ expect }) => {
    const queue = defineMessages((h) => ({
      UserCreated: h.withPayload<{ id: string; name: string }>(),
      UserRenamed: h.withPayload<{ id: string; name: string }>(),
    }));
    queue.push.UserCreated({ id: `usr-1`, name: `John` });

    for (const m of queue.expose()) {
      expect(m).toEqual({
        name: `UserCreated`,
        id: expect.any(String),
        payload: { id: `usr-1`, name: `John` },
      });
    }
  });

  it(`queue collection exposes payload type`, () => {
    const queue = defineMessages((h) => ({
      UserCreated: h.withPayload<{ id: string; name: string }>(),
      UserRenamed: h.withPayload<{ id: string; name: string }>(),
    }));
    const m = queue.expose();

    expectTypeOf(m.$types.UserCreated).toEqualTypeOf<{ id: string; name: string }>();
    expectTypeOf(m.$types.UserRenamed).toEqualTypeOf<{ id: string; name: string }>();
  });

  describe(`Class usage`, () => {
    it(`works inside a class`, async ({ expect }) => {
      // user.ts
      class User {
        constructor(readonly id = crypto.randomUUID()) {}

        get messages() {
          return this._messages.expose();
        }

        private readonly _messages = defineMessages((h) => ({
          Created: h.withPayload<{ id: string; name: string }>(),
          Renamed: h.withPayload<{ id: string; name: string }>(),
        }));

        static create(props: { name: string }): User {
          const user = new User();
          user._messages.push.Created({ id: user.id, name: props.name });

          return user;
        }

        rename(props: { name: string }): void {
          this._messages.push.Renamed({ id: this.id, name: props.name });
        }
      }

      // user.repository.ts
      type UserCreatedPayload = User["messages"]["$types"]["Created"];
      type UserRenamedPayload = User["messages"]["$types"]["Renamed"];

      class UserRepository {
        constructor(
          private readonly persistUserCreated: (_payload: UserCreatedPayload) => Promise<void>,
          private readonly persistUserRenamed: (_payload: UserRenamedPayload) => Promise<void>,
        ) {}

        async persist(user: User): Promise<void> {
          await user.messages.match({
            Created: (p) => this.persistUserCreated(p),
            Renamed: (p) => this.persistUserRenamed(p),
          });
        }
      }

      // create-user.use-case.ts
      const persistUserCreated = vi.fn<() => Promise<void>>(() => Promise.resolve());
      const persistUserRenamed = vi.fn<() => Promise<void>>(() => Promise.resolve());

      const repo = new UserRepository(persistUserCreated, persistUserRenamed);
      const user = User.create({ name: `john` });

      await repo.persist(user);

      expect(persistUserCreated).toHaveBeenCalled();
      expect(persistUserRenamed).not.toHaveBeenCalled();
    });
  });
});
