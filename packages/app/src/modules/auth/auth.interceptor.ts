import type { IncomingMessage } from "node:http";

import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from "@nestjs/common";
import { ClsService } from "nestjs-cls";

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): any {
    const req = context.switchToHttp().getRequest<IncomingMessage>();

    const authorization = req.headers["authorization"];
    if (!authorization || !/^bearer\s/i.test(authorization ?? "")) return next.handle();

    const bearer = authorization.replace(/^bearer\s+/i, "");
    this.cls.set("token", bearer);

    return next.handle();
  }
}
