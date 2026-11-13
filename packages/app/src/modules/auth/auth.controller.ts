import type { IncomingMessage } from "node:http";

import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from "@nestjs/common";
import { ApiBody, ApiHeader, ApiOkResponse, ApiResponse, ApiSecurity } from "@nestjs/swagger";

import { assertIsDefined } from "#/utils.js";

import { AuthService } from "./auth.service.js";
import {
  AuthSessionDtoSchema,
  AuthSigninDtoSchema,
  AuthSignupDtoSchema,
  type AuthSessionDto,
  type AuthSigninDto,
  type AuthSignupDto,
} from "./infrastructure/auth.dtos.js";

@Controller("/api/auth/v1")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("/signup")
  @ApiOkResponse({ standardSchema: AuthSessionDtoSchema })
  signup(
    @Body({ schema: AuthSignupDtoSchema })
    body: AuthSignupDto,
  ): Promise<AuthSessionDto> {
    return this.auth.signup(body);
  }

  @Post("/signin")
  @ApiSecurity("basic")
  @ApiBody({ required: false })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: HttpStatus.CREATED, standardSchema: AuthSessionDtoSchema })
  @ApiHeader({ name: `Authorization`, schema: { type: "string", pattern: "basic .+" } })
  signin(
    @Req() request: IncomingMessage,
    @Body({ schema: AuthSigninDtoSchema.optional() })
    body: AuthSigninDto | undefined,
  ): Promise<AuthSessionDto> {
    let email: string;
    let password: string;

    if (request.headers["authorization"]?.toLowerCase().startsWith("basic")) {
      const decoded = Buffer.from(
        request.headers["authorization"].replace(/basic\s+/i, ""),
        "base64",
      )
        .toString()
        .split(":");
      if (decoded.length !== 2) throw new BadRequestException();

      email = assertIsDefined(decoded[0], `no email in basic authorization`);
      password = assertIsDefined(decoded[1], `no password in basic authorization`);
    } else {
      if (!body) throw new BadRequestException();

      ({ email, password } = body);
    }

    return this.auth.signin({ email, password });
  }
}
