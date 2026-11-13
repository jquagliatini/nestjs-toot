import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

import { ApiAuthenticated, ParamAuthUser } from "../auth/auth.decorators.js";
import {
  CreateTootDtoSchema,
  TootCreatedDtoSchema,
  type CreateTootDto,
  type TootCreatedDto,
} from "./toots.dto.js";
import { TootsService } from "./toots.service.js";

@Controller("/api/toots/v1")
export class TootsController {
  constructor(private readonly toots: TootsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiAuthenticated()
  @ApiResponse({
    status: HttpStatus.CREATED,
    standardSchema: TootCreatedDtoSchema,
  })
  createToot(
    @ParamAuthUser() user: { id: string },
    @Body({ schema: CreateTootDtoSchema }) body: CreateTootDto,
  ): Promise<TootCreatedDto> {
    return this.toots.create({ content: body.content, authorId: user.id });
  }
}
