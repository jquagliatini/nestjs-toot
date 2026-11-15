import { DispatchableBus, dispatchables } from "@jqgl.cc/dispatchable";

export const authCommands = dispatchables({
  signin: (c) =>
    c
      .withPayload<{ email: string; password: string }>()
      .withResult<{ token: string; expiresAt: Date }>(),

  signup: (c) =>
    c
      .withPayload<{ email: string; password: string; username: string }>()
      .withResult<{ id: string; token: string; expiresAt: Date }>(),

  rehydrateToken: (c) => c.withPayload<{ token: string }>().withResult<{ id: string }>(),
});

export class AuthCommandBus extends DispatchableBus<typeof authCommands> {}
