import { describe, expect, expectTypeOf, it } from "vitest";

import { defineIds, type Id } from "./humanid.js";

describe("humanid", () => {
  it(`defines IDS`, () => {
    const ids = defineIds((__) => ({
      auth: { user: __ },
    }));

    const userId = ids.auth.user();
    expectTypeOf(userId).toEqualTypeOf<Id<"auth/user">>();
    expect(userId).toBeTypeOf("string");
    expect(userId).toMatch(
      /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
    );
  });

  it("returns the provided input", () => {
    const ids = defineIds((__) => ({
      auth: { user: __ },
    }));

    const id = ids.auth.user("usr-1");

    expect(id).toBe(`usr-1`);
    expectTypeOf(id).toEqualTypeOf<Id<"auth/user">>();
  });

  it(`throws when id definition has depth > 10`, () => {
    expect(() =>
      defineIds((__) => ({
        _1: { _2: { _3: { _4: { _5: { _6: { _7: { _8: { _9: { _10: { _11: __ } } } } } } } } } },
      })),
    ).toThrow(`id definition has depth > 10`);
  });
});
