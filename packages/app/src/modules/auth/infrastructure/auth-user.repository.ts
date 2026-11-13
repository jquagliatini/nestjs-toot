import { Transactional } from "@nestjs-cls/transactional";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";

import { IDS } from "#/ids.js";
import { Clock } from "#/modules/framework/clock.js";
import { authSessions, users, Db } from "#/modules/framework/database/schema.js";

import { AuthSession } from "../domain/auth-session.js";
import { AuthUser } from "../domain/auth-user.js";
import { Email } from "../domain/email.js";
import { Signer } from "../domain/signer.js";

@Injectable()
export class AuthUserRepository {
  private readonly logger = new Logger(AuthUserRepository.name);
  constructor(
    private readonly clock: Clock,
    private readonly signer: Signer,
    private readonly db: Db,
  ) {}

  async findByEmail(email: Email): Promise<AuthUser | null> {
    const user = await this.db.tx.query.users.findFirst({
      columns: { password: true, id: true },
      where: { email: email.toString() },
    });

    if (!user) {
      this.logger.warn(`user not found`);
      return null;
    }

    return AuthUser.from({ id: user.id, password: user.password });
  }

  async findByAuthSessionToken(signedSessionId: string): Promise<AuthUser> {
    const sessionId = this.signer.unsign(signedSessionId);
    if (!sessionId) throw new NotFoundException();

    const session = await this.db.tx.query.authSessions.findFirst({
      where: { id: sessionId },
      columns: { expiresAt: true, createdAt: true, id: true },
      with: { user: { columns: { id: true, password: true } } },
    });

    if (!session) throw new NotFoundException();
    AuthSession.from({
      now: this.clock.now(),
      createdAt: session.createdAt,
      id: IDS.auth.session(session.id),
    });

    return AuthUser.from(session.user);
  }

  @Transactional()
  async persist(user: AuthUser): Promise<void> {
    await user.messages.match({
      UserCreated: (m) => this.persistUserCreated(m),
      SessionStarted: (m) => this.persistSessionStarted(m),
    });
  }

  private async persistUserCreated(message: AuthUserCreated): Promise<void> {
    await this.db.tx.insert(users).values(message);
  }

  private async persistSessionStarted(message: AuthSessionStarted): Promise<void> {
    await this.db.tx.insert(authSessions).values({
      id: message.id,
      userId: message.userId,
      createdAt: message.createdAt,
      expiresAt: message.expiresAt,
    });
  }
}

type AuthUserCreated = AuthUser["messages"]["$types"]["UserCreated"];
type AuthSessionStarted = AuthUser["messages"]["$types"]["SessionStarted"];
