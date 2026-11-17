import type { Id } from "@jqgl.cc/humanid";

import { IDS } from "#/ids.js";
import { InternalException } from "#/modules/framework/errors.js";
import { time } from "#/utils.js";

export const ExpiredSession = InternalException(`auth.errors.expiredSession`);

export class AuthSession {
  private static DURATION = 90 * time.HOURS;

  readonly expiresAt: Date;
  private constructor(
    readonly id = IDS.auth.session(),
    readonly createdAt: Date,
  ) {
    this.expiresAt = AuthSession.expirationDate(this.createdAt);
  }

  static from(props: { id: Id<"auth/session">; createdAt: Date; now: Date }) {
    const expirationDate = AuthSession.expirationDate(props.createdAt);
    if (props.now.getTime() >= expirationDate.getTime()) {
      throw new ExpiredSession();
    }

    return new AuthSession(props.id, props.createdAt);
  }

  static create(props: { now: Date }): AuthSession {
    return new AuthSession(IDS.auth.session(), props.now);
  }

  private static expirationDate(instant: Date): Date {
    return new Date(instant.getTime() + this.DURATION);
  }
}
