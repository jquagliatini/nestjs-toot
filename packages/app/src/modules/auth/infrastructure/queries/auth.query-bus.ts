import { DispatchableBus, dispatchables } from "@jqgl.cc/dispatchable";

import type { AuthIntrospectionDto } from "../auth.dtos.js";

export const authQueries = dispatchables({
  introspect: (q) => q.withPayload<{ userId: string }>().withResult<AuthIntrospectionDto>(),
});

export class AuthQueryBus extends DispatchableBus<typeof authQueries> {}
