import * as crypto from "node:crypto";

import { z } from "zod";

import { InvalidInputException } from "#/modules/framework/errors.js";

export const InvalidEmail = InvalidInputException(`auth.errors.invalidEmail`);

/** We hash emails before storing them in case of data leak */
export class Email {
  private constructor(private readonly email: EmailPepperHash) {}
  toString(): string {
    return this.email.toString();
  }

  static async fromPlain(plainEmail: string): Promise<Email> {
    const plain = plainEmail.toLowerCase();
    const isValidEmail = z.email().validate(plain);
    if (!isValidEmail) throw new InvalidEmail();

    return new Email(await EmailPepperHash.fromPlain(plain));
  }
}

/**
 * We don't generate a dynamic salt before hashing,
 * since we need to retrieve users by their email.
 *
 * The hash is closer to a cipher in this case.
 */
class EmailPepperHash {
  /**
   * @warning the KEYLEN and PREFIX are part of the serialization and
   * should NOT BE CHANGED
   */
  private static KEYLEN = 32;
  private static PREFIX = `EmailHash:v1:scrypt`;

  /** @warning SHOULD NOT BE CHANGED */
  private static PEPPER = Buffer.from(
    "e007367bc8fa14f1b7597d496dc7dad5946545aff56afcc53dc43d0a688367c1",
    "hex",
  );

  private constructor(private readonly value: Buffer) {}

  private get prefix(): string {
    return [EmailPepperHash.PREFIX, String(EmailPepperHash.KEYLEN)].join(":");
  }

  toString(): string {
    return [this.prefix, this.value.toString("base64url")].join(":");
  }

  async equals(encoded: string): Promise<`NOT_COMPARABLE` | boolean> {
    if (!encoded.startsWith(this.prefix)) return `NOT_COMPARABLE` as const;

    const re = new RegExp(`^${this.prefix}:`);
    const bufferAsString = encoded.replace(re, "");
    const buffer = Buffer.from(bufferAsString, "base64url");

    return crypto.timingSafeEqual(this.value, buffer);
  }

  static async fromPlain(plainValue: string): Promise<EmailPepperHash> {
    return new EmailPepperHash(await this.encode(plainValue));
  }

  private static encode(value: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      crypto.scrypt(Buffer.from(value), this.PEPPER, this.KEYLEN, (err, derived) => {
        if (err) return reject(err);
        return resolve(derived);
      });
    });
  }
}
