import {
  applyDecorators,
  Injectable,
  Logger,
  NotFoundException,
  Param,
  type PipeTransform,
} from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { ApiBearerAuth } from "@nestjs/swagger";
import { ClsService } from "nestjs-cls";

import { AuthService } from "./auth.service.js";

@Injectable()
export class RehydrateUserPipe implements PipeTransform<void, Promise<{ id: string }>> {
  private readonly logger = new Logger(RehydrateUserPipe.name);

  constructor(private readonly modules: ModuleRef) {}

  async transform(): Promise<{ id: string }> {
    const cls = this.modules.get(ClsService, { strict: false });
    const auth = this.modules.get(AuthService, { strict: false });

    const token = cls.get("token");
    if (!token) {
      this.logger.warn(`could not access the token from the local context`);
      throw new NotFoundException();
    }

    const { id } = await auth.internalRehydrateToken(token);
    return { id };
  }
}

@Injectable()
export class OptionallyRehydrateUserPipe implements PipeTransform<
  void,
  Promise<{ id: string } | undefined>
> {
  constructor(private readonly modules: ModuleRef) {}

  async transform(): Promise<{ id: string } | undefined> {
    const pipe = this.modules.get(RehydrateUserPipe);
    (pipe as any).logger = { warn: () => {} };

    return pipe.transform().catch(() => undefined);
  }
}

export function ApiAuthenticated(): MethodDecorator {
  return applyDecorators(ApiBearerAuth("bearer"));
}

export function ParamAuthUser(): ParameterDecorator {
  return Param(RehydrateUserPipe);
}

export function ParamOptionalAuthUser(): ParameterDecorator {
  return Param(OptionallyRehydrateUserPipe);
}
