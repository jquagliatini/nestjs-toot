import { defineMessages } from "@jqgl.cc/messages";

import { IDS } from "#/ids.js";
import { InvalidInputException } from "#/modules/framework/errors.js";

import { AuthSession } from "./auth-session.js";
import { Email } from "./email.js";
import { Password } from "./password.js";
import { makeUsername } from "./username.js";

export const AuthenticationFailed = InvalidInputException(`auth.errors.authenticationFailed`);

export class AuthUser {
  private readonly _messages = defineMessages((h) => ({
    UserCreated: h.withPayload<{
      id: typeof IDS.auth.user.$type;
      username: string;
      email: string;
      password: string;
    }>(),

    SessionStarted: h.withPayload<{
      id: typeof IDS.auth.session.$type;
      userId: typeof IDS.auth.user.$type;
      createdAt: Date;
      expiresAt: Date;
    }>(),
  }));

  get messages() {
    return this._messages.expose();
  }

  private constructor(
    private readonly password: Password,
    readonly id = IDS.auth.user(),
  ) {}

  static from(props: { id: string; password: string }): AuthUser {
    return new AuthUser(Password.fromSerialized(props.password), IDS.auth.user(props.id));
  }

  startSession(props: { now: Date }): AuthSession {
    const session = AuthSession.create({ now: props.now });
    this._messages.push.SessionStarted({
      id: session.id,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      userId: this.id,
    });

    return session;
  }

  async authenticate(props: { now: Date; plainPassword: string }): Promise<AuthSession> {
    const passwordEqual = await this.password.equals(props.plainPassword);
    if (!passwordEqual) throw new AuthenticationFailed();

    return this.startSession(props);
  }

  static async create(props: {
    username: string;
    email: string;
    password: string;
  }): Promise<AuthUser> {
    const email = await Email.fromPlain(props.email);
    const password = await Password.fromPlain(props.password);
    const username = makeUsername(props.username);

    const user = new AuthUser(password);
    user._messages.push.UserCreated({
      id: user.id,
      username,
      email: email.toString(),
      password: password.toString(),
    });

    return user;
  }
}
