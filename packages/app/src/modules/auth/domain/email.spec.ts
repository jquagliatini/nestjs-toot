import { describe, it } from "vitest";

import { Email } from "./email.js";

describe("email", () => {
  it("hashes an email", async ({ expect }) => {
    const email = await Email.fromPlain(`john.doe@mail.co`);
    expect(email.toString()).toMatch(/^EmailHash:v1:scrypt:32:[A-z0-9-+/]+/);
  });

  it(`throws when the input is not an email`, async ({ expect }) => {
    await expect(() => Email.fromPlain(`not_en_email`)).rejects.toThrow(`auth.errors.invalidEmail`);
  });
});
