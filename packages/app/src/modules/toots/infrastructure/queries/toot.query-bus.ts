import { DispatchableBus, dispatchables } from "@jqgl.cc/dispatchable";

import type { Pagination } from "#/modules/framework/pagination.js";

import type { DetailedTootDto, ListedCommentsDto, ListedTootsDto } from "../../toots.dto.js";

export const tootQueries = dispatchables({
  ListToots: (q) =>
    q.withPayload<{ pagination: Pagination; userId: string | null }>().withResult<ListedTootsDto>(),
  DetailToot: (q) =>
    q.withPayload<{ id: string; userId: string | null }>().withResult<DetailedTootDto>(),
  ListComments: (q) =>
    q.withPayload<{ pagination: Pagination; tootId: string }>().withResult<ListedCommentsDto>(),
});

export class TootsQueryBus extends DispatchableBus<typeof tootQueries> {}
