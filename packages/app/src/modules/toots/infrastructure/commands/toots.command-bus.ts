import { DispatchableBus, dispatchables } from "@jqgl.cc/dispatchable";

export const tootCommands = dispatchables({
  CreateToot: (c) =>
    c.withPayload<{ authorId: string; content: string }>().withResult<{ id: string }>(),

  Comment: (c) =>
    c
      .withPayload<{ tootId: string; content: string; authorId: string }>()
      .withResult<{ id: string }>(),

  Like: (c) => c.withPayload<{ tootId: string; authorId: string }>().withResult<void>(),

  Unlike: (c) => c.withPayload<{ tootId: string; authorId: string }>().withResult<void>(),
});

export class TootsCommandBus extends DispatchableBus<typeof tootCommands> {}
