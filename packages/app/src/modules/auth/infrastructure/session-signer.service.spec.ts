import { describe, it } from "vitest";
import { mock } from "vitest-mock-extended";

import { IDS } from "#/ids.js";

import { AuthSession } from "../domain/auth-session.js";
import type { Signer } from "../domain/signer.js";
import { SessionSigner } from "./session-signer.service.js";

describe("SessionSigner", () => {
  it(`signs an AuthSession`, ({ expect }) => {
    const session = AuthSession.from({
      id: IDS.auth.session(),
      now: new Date("2026-03-01T10:00:00Z"),
      createdAt: new Date("2026-03-01T09:55:59Z"),
    });

    const cryptoSigner = mock<Signer>();
    cryptoSigner.sign.calledWith(session.id).mockImplementation((v) => v);

    const signer = new SessionSigner(cryptoSigner);
    const { token, expiresAt } = signer.sign(session);

    expect(cryptoSigner.sign).toHaveBeenCalledWith(session.id);
    expect(token).toBe(session.id);
    expect(expiresAt).toEqual(session.expiresAt);
  });
});
