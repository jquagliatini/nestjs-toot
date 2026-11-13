import {
  applyDecorators,
  Injectable,
  Logger,
  NotFoundException,
  type PipeTransform,
  UsePipes,
} from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { ApiBearerAuth } from "@nestjs/swagger";
import { ClsService } from "nestjs-cls";

import { assertIsDefined } from "#/utils.js";

import { AuthService } from "./auth.service.js";

@Injectable()
export class RehydrateUserPipe implements PipeTransform {
  private readonly logger = new Logger(RehydrateUserPipe.name);

  constructor(private readonly modules: ModuleRef) {}

  async transform() {
    const context = this.modules.get(ClsService, { strict: false });
    const auth = this.modules.get(AuthService, { strict: false });

    const token = context.get("token");
    if (!token) {
      this.logger.warn(`could not access the token from the local context`);
      throw new NotFoundException();
    }

    const { id: userId } = await auth.internalRehydrateToken(token);

    context.set("userId", userId);
  }
}

export function ApiAuthenticated(): MethodDecorator {
  return applyDecorators(ApiBearerAuth("bearer"), UsePipes(RehydrateUserPipe));
}

@Injectable()
export class RetrieveUserPipe implements PipeTransform {
  constructor(private readonly context: ClsService) {}

  async transform() {
    const userId = this.context.get("userId");
    return { id: assertIsDefined(userId) };
  }
}

export function ParamAuthUser(): ParameterDecorator {
  return UsePipes(RetrieveUserPipe);
}
