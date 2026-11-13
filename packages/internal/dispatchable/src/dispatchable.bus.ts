import type { AbstractDispatchable, Dispatchable } from "./dispatchable.js";
import type { DispatchableTransport } from "./transport.js";

export class DispatchableBus<
  Dictionary extends Record<string, (p: any) => AbstractDispatchable> = Record<
    string,
    (p: any) => AbstractDispatchable
  >,
> {
  readonly dispatch: {
    [K in Extract<keyof Dictionary, string>]: Dictionary[K] extends (
      p: any,
    ) => Dispatchable<string, infer P, infer R>
      ? (payload: P) => R
      : (payload: any) => Promise<unknown>;
  };

  readonly dispatchAsync: {
    [K in Extract<keyof Dictionary, string>]: Dictionary[K] extends (
      p: any,
    ) => Dispatchable<string, infer P, any>
      ? (payload: P) => Promise<void>
      : (payload: any) => Promise<void>;
  };

  static build<D extends Record<string, (p: any) => AbstractDispatchable>>(options: {
    transport: DispatchableTransport;
    featureName: string;
    dispatchables: D;
  }): DispatchableBus<D> {
    return new DispatchableBus(options.featureName, options.transport, options.dispatchables);
  }

  constructor(
    /** the feature name must stay consistant across app restart */
    private readonly featureName: string,
    private readonly transport: DispatchableTransport,
    dispatchables: Dictionary,
  ) {
    this.dispatch = Object.fromEntries(
      Object.entries(dispatchables).map(([k, d]) => [
        k,
        (p: any) => this.transport.dispatch(this.featureName, d(p)),
      ]),
    ) as any;

    this.dispatchAsync = Object.fromEntries(
      Object.entries(dispatchables).map(([k, d]) => [
        k,
        (p: any) => this.transport.dispatchAsync(this.featureName, d(p)),
      ]),
    ) as any;
  }
}
