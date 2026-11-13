import { test, vi } from "vitest";
import { mock } from "vitest-mock-extended";

import { IDS } from "#/ids.js";
import type { Clock } from "#/modules/framework/clock.js";
import { time } from "#/utils.js";

import { AuthUser } from "../../domain/auth-user.js";
import { Password } from "../../domain/password.js";
import type { AuthUserRepository } from "../auth-user.repository.js";
import type { SessionSigner } from "../session-signer.service.js";
import { SigninCommandHandler } from "./signin.command.js";

vi.mock(import("@nestjs-cls/transactional"), async (original) => {
  const transactional = await original();

  return { ...transactional, Transactional: () => () => {} };
});

test(`SigninCommandHandler`, async ({ expect }) => {
  const clock = mock<Clock>({ now: () => new Date("2026-02-01T10:00:00Z") });
  const signer = mock<SessionSigner>({
    sign(session) {
      return { token: session.id, expiresAt: session.expiresAt };
    },
  });

  const plainPassword = `p4s$w0rdOf15Characters`;
  const password = await Password.fromPlain(plainPassword);
  const mockUser = AuthUser.from({ id: IDS.auth.user(), password: password.toString() });

  const repository = mock<AuthUserRepository>({ persist: () => Promise.resolve() });
  repository.findByEmail.mockResolvedValue(mockUser);

  const handler = new SigninCommandHandler(clock, signer, repository);
  const { token } = await handler.handle({ email: "john.doe@mail.co", password: plainPassword });

  expect(token).toBeTypeOf("string");

  expect([...mockUser.messages]).toEqual([
    {
      id: expect.any(String),
      name: "SessionStarted",
      payload: {
        userId: mockUser.id,
        id: expect.any(String),
        createdAt: clock.now(),
        expiresAt: new Date(clock.now().getTime() + 90 * time.HOURS),
      },
    },
  ]);
});
