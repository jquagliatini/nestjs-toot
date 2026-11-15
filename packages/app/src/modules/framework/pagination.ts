import type { IncomingMessage } from "node:http";

import { applyDecorators, BadRequestException, createParamDecorator } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";
import { z } from "zod";

const PAGINATION_DEFAULTS = {
  pageIndex: { minimum: 0, default: 0 },
  pageSize: { minimum: 2, maximum: 1_000, default: 25 },
};

export type Pagination = {
  pageIndex: number;
  pageSize: number;
  path: string;
};

export const ParamPagination = createParamDecorator<
  {
    pageIndex?: { strategy: "truncate" | "throw" };
    pageSize?: {
      minimum?: number;
      maximum?: number;
      default?: number;
      strategy?: "truncate" | "throw";
    };
  },
  Pagination
>((options, ctx) => {
  const _options = {
    pageIndex: {
      strategy: "truncate",
      default: PAGINATION_DEFAULTS.pageIndex.default,
      minimum: PAGINATION_DEFAULTS.pageIndex.minimum,
      ...(options ?? {}).pageIndex,
    },
    pageSize: {
      strategy: "truncate",
      default: PAGINATION_DEFAULTS.pageSize.default,
      minimum: PAGINATION_DEFAULTS.pageSize.minimum,
      maximum: PAGINATION_DEFAULTS.pageSize.maximum,
      ...(options ?? {}).pageSize,
    },
  };

  const req = ctx.switchToHttp().getRequest<IncomingMessage>();
  const url = new URL(req.url ?? "", "http://example.com");

  let pageIndex: number;
  if (url.searchParams.has("p")) {
    pageIndex = Number(url.searchParams.get("p")) - 1;
  } else if (url.searchParams.has("page")) {
    pageIndex = Number(url.searchParams.get("page")) - 1;
  } else if (url.searchParams.has("pageIndex")) {
    pageIndex = Number(url.searchParams.get("pageIndex"));
  } else {
    pageIndex = _options.pageIndex.default;
  }

  pageIndex = Math.trunc(pageIndex);
  if (!Number.isFinite(pageIndex) || pageIndex < _options.pageIndex.minimum) {
    if (_options.pageIndex.strategy === "throw") {
      throw new BadRequestException();
    }

    pageIndex = PAGINATION_DEFAULTS.pageIndex.default;
  }

  let pageSize: number = Math.trunc(
    Number(url.searchParams.get("pageSize") ?? PAGINATION_DEFAULTS.pageSize.default),
  );

  if (
    !Number.isFinite(pageSize) ||
    pageSize < _options.pageSize.minimum ||
    pageSize > _options.pageSize.maximum
  ) {
    if (_options.pageSize.strategy === "throw") throw new BadRequestException();

    pageSize = _options.pageSize.default;
  }

  return { pageIndex, pageSize, path: url.toString().replace(url.origin, "") } satisfies Pagination;
});

export type Paginated<T> = { items: T[]; totalCount: number; next?: string; previous?: string };

export function ApiPaginated(
  options: {
    pageSize?: { minimum?: number; maximum?: number; default?: number };
  } = {},
): MethodDecorator {
  const pageSizeMinimum = options.pageSize?.minimum ?? PAGINATION_DEFAULTS.pageSize.minimum;
  const pageSizeMaximum = options.pageSize?.maximum ?? PAGINATION_DEFAULTS.pageSize.maximum;
  const pageSizeDefault = options.pageSize?.default ?? PAGINATION_DEFAULTS.pageSize.default;

  return applyDecorators(
    ApiQuery({
      name: `pageIndex`,
      required: false,
      type: "number",
      format: "int32",
      nullable: true,
      minimum: PAGINATION_DEFAULTS.pageIndex.default,
      default: PAGINATION_DEFAULTS.pageIndex.default,
    }),
    ApiQuery({
      name: `pageSize`,
      required: false,
      type: "number",
      format: "int32",
      minimum: pageSizeMinimum,
      maximum: pageSizeMaximum,
      default: pageSizeDefault,
    }),
  );
}

export function paginate<T>(options: {
  items: readonly T[];
  totalCount: number;
  pagination: Pagination;
}): Paginated<T> {
  const cleanUrl = new URL(options.pagination.path, "http://example.com");
  cleanUrl.searchParams.delete("p");
  cleanUrl.searchParams.delete("page");
  cleanUrl.searchParams.delete("pageSize");
  cleanUrl.searchParams.delete("pageIndex");

  const nextUrl = new URL(cleanUrl);
  nextUrl.searchParams.set("pageSize", String(options.pagination.pageSize));
  nextUrl.searchParams.set("pageIndex", String(options.pagination.pageIndex + 1));
  const next = nextUrl.toString().replace(nextUrl.origin, "");

  const previousUrl = new URL(cleanUrl);
  previousUrl.searchParams.set("pageSize", String(options.pagination.pageSize));
  previousUrl.searchParams.set("pageIndex", String(options.pagination.pageIndex - 1));
  const previous = previousUrl.toString().replace(previousUrl.origin, "");

  const hasNext =
    options.totalCount > (options.pagination.pageIndex + 1) * options.pagination.pageSize;
  const hasPrevious = options.totalCount > 0 && options.pagination.pageIndex > 0;

  const { items, totalCount } = options;
  const output: Paginated<T> = { items: items as T[], totalCount };

  if (hasNext) output.next = next;
  if (hasPrevious) output.previous = previous;

  return output;
}

export function paginatedSchema<T extends z.ZodType>(schema: T) {
  return z.object({
    items: z.array(schema),
    totalCount: z.int().gte(0),
    next: z.string().optional(),
    previous: z.string().optional(),
  });
}
