import { describe, it } from "vitest";

import { CantDeserializePassword, Password, PasswordPoliciesFailed } from "./password.js";

describe(`Password`, () => {
  it.for([
    [`$Sh0rt`, [`more than 15 characters`]],
    [`myP4sW0rdof15Characters`, [`one symbol`]],
    [`myPas$WordoffifteenCharacters`, [`one digit`]],
    [`p4s$w0rd15characters`, [`one uppercase and one lowercase letter`]],
    [`P4S$W0RD15CHARACTERS`, [`one uppercase and one lowercase letter`]],
    [`myP4$sW0rd${"x".repeat(1_001)}`, [`less than 1000 characters`]],
  ] as const)(`"%s" fails`, async ([value, keys], { expect }) => {
    await expect(Password.fromPlain(value)).rejects.toThrow(
      new PasswordPoliciesFailed(keys.map((x) => `auth.password.policy.${x}`)),
    );
  });

  it(`serializes`, async ({ expect }) => {
    const validPlainPassword = `myP4$sW0rdof15Characters`;

    const password = await Password.fromPlain(validPlainPassword);
    const deserialized = Password.fromSerialized(password.toString());

    expect(await deserialized.equals(validPlainPassword)).toBe(true);
  });

  it(`throws on serialization format invalid`, ({ expect }) => {
    expect(() => Password.fromSerialized(`unknownPassword`)).toThrow(CantDeserializePassword);
  });

  describe("Given a valid plain password", () => {
    const validPlainPassword = `myP4$sW0rdof15Characters`;

    it(`hashes a password`, async ({ expect }) => {
      const pass = await Password.fromPlain(validPlainPassword);
      expect(pass.toString()).toMatch(/^PasswordHash:v1:scrypt:32:[A-z0-9-+/]+:[A-z0-9-+/]+/);
    });

    it(`never produces the same hash`, async ({ expect }) => {
      const p1 = await Password.fromPlain(validPlainPassword);
      const p2 = await Password.fromPlain(validPlainPassword);

      expect(p1.toString()).not.toBe(p2.toString());
    });

    it(`compares successfully with plain text`, async ({ expect }) => {
      const pass = await Password.fromPlain(validPlainPassword);

      const result = await pass.equals(validPlainPassword);
      expect(result).toBe(true);
    });
  });
});
