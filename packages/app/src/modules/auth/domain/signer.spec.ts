import { describe, it } from "vitest";

import { InvalidSignature, Signer } from "./signer.js";

describe("Signer", () => {
  const signer = new Signer(Buffer.from(`secret-befd20ed-b128-4cce-a337-af2866083d92`));

  it(`signs data`, ({ expect }) => {
    const signed = signer.sign("data");
    expect(signed).toMatch(/data\.[A-z0-9-+/]+/);

    const unsigned = signer.unsign(signed);
    expect(unsigned).toBe("data");
  });

  it(`can't unsign when signature was altered`, ({ expect }) => {
    const signed = signer.sign("data");
    const signatureAltered = signed.slice(0, -2);

    const unsigned = signer.unsign(signatureAltered);
    expect(unsigned).toBeNull();
  });

  it(`can't unsign when data was altered`, ({ expect }) => {
    const signed = signer.sign("data");
    const dataAltered = signed.slice(2);

    const unsigned = signer.unsign(dataAltered);
    expect(unsigned).toBeNull();
  });

  it(`can't unsign with invalid data`, ({ expect }) => {
    expect(() => signer.unsign(`data`)).toThrow(InvalidSignature);
  });
});
