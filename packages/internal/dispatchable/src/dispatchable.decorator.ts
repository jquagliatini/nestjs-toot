import { applyDecorators, Injectable, SetMetadata } from "@nestjs/common";

import type { AbstractDispatchable, Dispatchable } from "./dispatchable.js";

export type DispatchableHandler<
  T extends (p: any) => AbstractDispatchable = (p: any) => AbstractDispatchable,
> = T extends (p: any) => Dispatchable<string, infer P, infer R>
  ? { handle(payload: P): R }
  : { handle(payload: any): Promise<unknown> };

type HandlerCtor = {
  new (...args: any[]): DispatchableHandler;
};

export const DISPATCHABLE_HANDLER_META = "__DISPATCHABLE_HANDLER_META__";
export function InjectableHandler(handler: {
  dispatchableName: string;
}): (target: HandlerCtor) => void {
  return applyDecorators(
    Injectable(),
    SetMetadata(DISPATCHABLE_HANDLER_META, handler.dispatchableName),
  );
}
