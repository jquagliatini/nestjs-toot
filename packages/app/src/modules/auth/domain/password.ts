import assert from "node:assert";
import * as crypto from "node:crypto";

import { BadRequestException } from "@nestjs/common";
import { t, type I18nKey } from "@nestjs/i18n";

import { InternalException } from "#/modules/framework/errors.js";
import { assertIsDefined } from "#/utils.js";

export const CantDeserializePassword = InternalException(`auth.errors.cantDeserializePassword`);
export class PasswordPoliciesFailed extends BadRequestException {
  constructor(readonly failures: readonly string[]) {
    assert.ok(failures.length > 0);

    super({
      failures,
      message: t(`auth.password.policy failed`, { args: { count: failures.length } }),
    });
  }
}

export class Password {
  static async timingSafeStubComparison(): Promise<void> {
    await Password.fromPlain(crypto.randomUUID());
  }

  private constructor(private readonly hash: PasswordHash) {}

  toString(): string {
    return this.hash.toString();
  }

  equals(plain: string): Promise<boolean> {
    return this.hash.equals(plain);
  }

  static async fromPlain(password: string): Promise<Password> {
    this.assertValidatesPolicies(password);

    return new Password(await PasswordHash.fromPlain(password));
  }

  private static assertValidatesPolicies(plain: string): asserts plain {
    const failures: string[] = [];
    const policyEntries = Object.entries(this.policies) as [I18nKey, (x: string) => boolean][];
    for (const [key, assertion] of policyEntries) {
      if (!assertion(plain)) {
        failures.push(t(key));
      }
    }

    if (failures.length > 0) throw new PasswordPoliciesFailed(failures);
  }

  static fromSerialized(serialized: string): Password {
    const deserialized = PasswordHash.deserialize(serialized);
    if (deserialized === "NOT_COMPATIBLE") throw new CantDeserializePassword();
    return new Password(deserialized);
  }

  /** OWASP policies @see https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html */
  static readonly policies = {
    "auth.password.policy.more than 15 characters": (x: string) => x.length >= 15,
    "auth.password.policy.less than 1000 characters": (x: string) => x.length <= 1_000,
    "auth.password.policy.one uppercase and one lowercase letter": (x: string) =>
      /\p{Lu}/u.test(x) && /\p{Ll}/u.test(x),
    "auth.password.policy.one digit": (x: string) => /\p{N}/u.test(x),
    "auth.password.policy.one symbol": (x: string) => /[\p{M}\p{S}]/u.test(x),
  } satisfies Record<Extract<I18nKey, `auth.password.policy.${string}`>, (x: string) => boolean>;
}

class PasswordHash {
  private static readonly KEYLEN = 32;
  private static readonly PREFIX = `PasswordHash:v1:scrypt`;
  private static readonly prefix = [PasswordHash.PREFIX, String(PasswordHash.KEYLEN)].join(":");

  private constructor(
    private readonly salt: Buffer,
    private readonly hashed: Buffer,
  ) {}

  async equals(plain: string): Promise<boolean> {
    const { hashed } = await PasswordHash.encode(plain, this.salt);
    return crypto.timingSafeEqual(hashed, this.hashed);
  }

  static deserialize(serialized: string): PasswordHash | `NOT_COMPATIBLE` {
    if (!serialized.startsWith(PasswordHash.prefix)) {
      return `NOT_COMPATIBLE`;
    }

    const [hashed, salt] = serialized.split(":").reverse();
    return new PasswordHash(
      Buffer.from(assertIsDefined(salt), "base64url"),
      Buffer.from(assertIsDefined(hashed), "base64url"),
    );
  }

  static async fromPlain(plain: string): Promise<PasswordHash> {
    const { salt, hashed } = await this.encode(plain);
    return new PasswordHash(salt, hashed);
  }

  toString(): string {
    return [
      PasswordHash.prefix,
      this.salt.toString("base64url"),
      this.hashed.toString("base64url"),
    ].join(":");
  }

  private static encode(plain: string, salt?: Buffer): Promise<{ hashed: Buffer; salt: Buffer }> {
    salt ??= crypto.randomBytes(this.KEYLEN);
    return new Promise((resolve, reject) => {
      crypto.scrypt(Buffer.from(plain), salt, this.KEYLEN, (err, derived) => {
        if (err) return reject(err);
        return resolve({ salt, hashed: derived });
      });
    });
  }
}
