import { z } from "zod";

import { paginatedSchema } from "#/modules/framework/pagination.js";
import { datetimeCodec } from "#/utils.js";

export const CreateTootDtoSchema = z.object({
  content: z.string().trim().nonempty(),
});
export type CreateTootDto = z.output<typeof CreateTootDtoSchema>;

export const TootCreatedDtoSchema = z.object({
  id: z.string().meta({ example: `77c2a038-2a90-4754-9e9d-b392bf51d771` }),
});
export type TootCreatedDto = z.output<typeof TootCreatedDtoSchema>;

export const ListedTootsDtoSchema = paginatedSchema(
  z.object({
    id: z.string(),
    content: z.string(),
    createdAt: datetimeCodec,
    author: z.object({ id: z.string(), username: z.string() }),
    likesCount: z.number().int().gte(0),
    commentsCount: z.number().int().gte(0),

    connectedUser: z
      .object({
        liked: z.boolean(),
        author: z.boolean(),
        permissions: z.array(z.enum(["comment", "like", "unlike"])),
      })
      .nullable(),
  }),
);
export type ListedTootsDto = z.input<typeof ListedTootsDtoSchema>;

export const DetailedTootDtoSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: datetimeCodec,
  author: z.object({ id: z.string(), username: z.string() }),
  connectedUser: z
    .object({
      liked: z.boolean(),
      author: z.boolean(),
      permissions: z.array(z.enum(["comment", "like", "unlike"])),
    })
    .nullable(),
  likesCount: z.number().int(),
  comments: paginatedSchema(
    z.object({
      id: z.string(),
      content: z.string(),
      createdAt: datetimeCodec,
      author: z.object({ id: z.string(), username: z.string() }).nullable(),
      connectedUser: z.object({ author: z.boolean() }).nullable(),
    }),
  ),
});
export type DetailedTootDto = z.input<typeof DetailedTootDtoSchema>;

export const CommentDtoSchema = z.object({ content: z.string().trim().nonempty() });
export type CommentDto = z.input<typeof CommentDtoSchema>;

export const CommentedDtoSchema = z.object({ id: z.string() });
export type CommentedDto = z.input<typeof CommentedDtoSchema>;

export const ListedCommentsDtoSchema = paginatedSchema(
  z.object({
    id: z.string(),
    content: z.string(),
    createdAt: datetimeCodec,
    author: z.object({ id: z.string(), username: z.string() }).nullable(),
  }),
);
export type ListedCommentsDto = z.input<typeof ListedCommentsDtoSchema>;
