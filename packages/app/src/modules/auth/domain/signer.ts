import * as crypto from "node:crypto";

import { InvalidInputException } from "#/modules/framework/errors.js";

export const InvalidSignature = InvalidInputException(`auth.errors.invalidSignature`);

export class Signer {
  constructor(private readonly secret: Buffer) {}

  sign(value: string): string {
    const signature = this.computeSignature(value).toString("base64url");
    return [value, signature].join(".");
  }

  unsign(signedValue: string): string | null {
    const idx = signedValue.lastIndexOf(".");
    if (idx === -1) throw new InvalidSignature();

    const data = signedValue.slice(0, idx);
    const signature = Buffer.from(signedValue.slice(idx + 1), "base64url");

    const computed = this.computeSignature(data);
    if (
      signature.byteLength == computed.byteLength &&
      crypto.timingSafeEqual(signature, computed)
    ) {
      return data;
    }

    return null;
  }

  private computeSignature(value: string): Buffer {
    return crypto.createHmac(`sha256`, this.secret).update(value).digest();
  }
}
