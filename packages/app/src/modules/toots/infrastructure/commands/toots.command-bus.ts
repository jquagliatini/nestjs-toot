import { DispatchableBus, dispatchables } from "@jqgl.cc/dispatchable";

export const tootCommands = dispatchables({
  CreateToot: (c) =>
    c.withPayload<{ authorId: string; content: string }>().withResult<{ id: string }>(),
});

export class TootsCommandBus extends DispatchableBus<typeof tootCommands> {}
