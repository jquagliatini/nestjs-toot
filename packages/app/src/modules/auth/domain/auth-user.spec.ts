import { describe, it } from "vitest";
import { z } from "zod";

import { IDS } from "#/ids.js";
import { time } from "#/utils.js";

import { AuthenticationFailed, AuthUser } from "./auth-user.js";
import { Password } from "./password.js";

describe("AuthUser", () => {
  const plainPassword = "mYp4s$w0rdOf15Characters";

  it("creates a user", async ({ expect }) => {
    const user = await AuthUser.create({
      username: "john.doe",
      email: "john.doe@mail.co",
      password: plainPassword,
    });

    expect([...user.messages]).toEqual([
      expect.schemaMatching(
        z.object({
          id: z.uuid(),
          name: z.literal("UserCreated"),
          payload: z.object({
            username: z.literal("john.doe"),
            email: z.string().regex(new RegExp("EmailHash:v1:scrypt:32:[A-z0-9+-/]+")),
            password: z
              .string()
              .regex(new RegExp("PasswordHash:v1:scrypt:32:[A-z0-9+-/]+:[A-z0-9+-/]+")),
          }),
        }),
      ),
    ]);
  });

  it("authenticates", async ({ expect }) => {
    const password = await Password.fromPlain(plainPassword).then((p) => p.toString());
    const user = AuthUser.from({
      password,
      id: IDS.auth.user(),
    });

    const session = await user.authenticate({
      plainPassword,
      now: new Date("2026-02-01T10:00:00Z"),
    });

    expect(session.id).toEqual(expect.schemaMatching(z.uuid()));
    expect(session.createdAt).toEqual(new Date("2026-02-01T10:00:00Z"));
    expect(session.expiresAt).toEqual(
      new Date(new Date("2026-02-01T10:00:00Z").getTime() + 90 * time.HOURS),
    );

    expect([...user.messages]).toEqual([
      expect.schemaMatching(
        z.object({
          id: z.uuid(),
          name: z.literal("SessionStarted"),
          payload: z.object({
            id: z.uuid(),
            userId: z.uuid(),
            createdAt: z.date(),
            expiresAt: z.date(),
          }),
        }),
      ),
    ]);
  });

  it("prevents authentication when password are not equal", async ({ expect }) => {
    const password = await Password.fromPlain(plainPassword).then((p) => p.toString());
    const user = AuthUser.from({
      password,
      id: IDS.auth.user(),
    });

    await expect(() =>
      user.authenticate({
        plainPassword: `anotherP3s$w0rdOf15Characters`,
        now: new Date("2026-02-01T10:00:00Z"),
      }),
    ).rejects.toThrow(AuthenticationFailed);
  });

  it("starts a session", async ({ expect }) => {
    const password = await Password.fromPlain(plainPassword).then((p) => p.toString());
    const user = AuthUser.from({
      password,
      id: IDS.auth.user(),
    });

    user.startSession({ now: new Date("2026-02-01T10:10:00Z") });
    expect([...user.messages]).toEqual([
      expect.schemaMatching(
        z.object({
          id: z.uuid(),
          name: z.literal("SessionStarted"),
          payload: z.object({
            id: z.uuid(),
            userId: z.uuid(),
            createdAt: z.date(),
            expiresAt: z.date(),
          }),
        }),
      ),
    ]);
  });
});
