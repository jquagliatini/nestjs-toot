import { Injectable } from "@nestjs/common";

import type { AuthSession } from "../domain/auth-session.js";
import { Signer } from "../domain/signer.js";

@Injectable()
export class SessionSigner {
  constructor(private readonly signer: Signer) {}

  sign(session: AuthSession): { token: string; expiresAt: Date } {
    const token = this.signer.sign(session.id);
    return { token, expiresAt: session.expiresAt };
  }
}
