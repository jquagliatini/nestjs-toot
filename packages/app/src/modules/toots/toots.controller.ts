import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

import { ApiAuthenticated, ParamAuthUser, ParamOptionalAuthUser } from "../auth/auth.decorators.js";
import { ApiPaginated, ParamPagination, type Pagination } from "../framework/pagination.js";
import {
  CommentDtoSchema,
  CommentedDtoSchema,
  CreateTootDtoSchema,
  DetailedTootDtoSchema,
  ListedCommentsDtoSchema,
  ListedTootsDtoSchema,
  TootCreatedDtoSchema,
  type CommentDto,
  type CommentedDto,
  type CreateTootDto,
  type DetailedTootDto,
  type ListedCommentsDto,
  type ListedTootsDto,
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

  @Get()
  @ApiPaginated()
  @ApiResponse({
    status: HttpStatus.OK,
    standardSchema: ListedTootsDtoSchema,
  })
  listToots(
    @ParamPagination() pagination: Pagination,
    @ParamOptionalAuthUser() user: { id: string } | undefined,
  ): Promise<ListedTootsDto> {
    return this.toots.list({ pagination, userId: user?.id ?? null });
  }

  @Get("/:id")
  @ApiResponse({
    status: HttpStatus.OK,
    standardSchema: DetailedTootDtoSchema,
  })
  detailToot(
    @Param("id") id: string,
    @ParamOptionalAuthUser() user: { id: string } | undefined,
  ): Promise<DetailedTootDto> {
    return this.toots.detail({ id, userId: user?.id ?? null });
  }

  @Post("/:id/comments")
  @ApiAuthenticated()
  @ApiResponse({ status: HttpStatus.CREATED, standardSchema: CommentedDtoSchema })
  comment(
    @ParamAuthUser() user: { id: string },
    @Param("id") tootId: string,
    @Body({ schema: CommentDtoSchema }) { content }: CommentDto,
  ): Promise<CommentedDto> {
    return this.toots.comment({ content, tootId, authorId: user.id });
  }

  @Get("/:id/comments")
  @ApiPaginated()
  @ApiResponse({ status: HttpStatus.OK, standardSchema: ListedCommentsDtoSchema })
  listComments(
    @Param("id") tootId: string,
    @ParamPagination() pagination: Pagination,
  ): Promise<ListedCommentsDto> {
    return this.toots.listComments({ tootId, pagination });
  }

  @Put("/:id/likes")
  @ApiAuthenticated()
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  like(@Param("id") tootId: string, @ParamAuthUser() user: { id: string }): Promise<void> {
    return this.toots.like({ tootId, authorId: user.id });
  }

  @Delete("/:id/likes")
  @ApiAuthenticated()
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @HttpCode(HttpStatus.NO_CONTENT)
  unlike(@Param("id") tootId: string, @ParamAuthUser() user: { id: string }): Promise<void> {
    return this.toots.unlike({ tootId, authorId: user.id });
  }
}
