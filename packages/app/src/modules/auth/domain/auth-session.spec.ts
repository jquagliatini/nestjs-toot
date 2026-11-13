import { describe, it } from "vitest";

import { IDS } from "#/ids.js";

import { AuthSession, ExpiredSession } from "./auth-session.js";

describe("AuthSession", () => {
  it(`prevents expired auth session rehydration`, ({ expect }) => {
    expect(() =>
      AuthSession.from({
        now: new Date("2026-02-01T10:00:00Z"),
        id: IDS.auth.session(),
        createdAt: new Date("2026-01-20T10:00:00Z"),
      }),
    ).toThrow(ExpiredSession);
  });
});
