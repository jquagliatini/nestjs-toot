import type { AbstractDispatchable, Dispatchable } from "./dispatchable.js";

type Handler<D> =
  D extends Dispatchable<string, any, infer R> ? (d: D) => R : (d: D) => Promise<unknown>;

/**
 * A dispatchable Transport, is the transport mechanism to dispatch the Dispatchable
 * and handling it.
 */
export interface DispatchableTransport extends AsyncDisposable {
  forceClose(): void;
  open(): Promise<void>;
  close(): Promise<void>;

  /** dispatches and waits for the result */
  dispatch<D extends AbstractDispatchable>(
    busId: string,
    d: D,
  ): D extends Dispatchable<string, any, infer R> ? R : Promise<unknown>;

  /** dispatches and does not wait for the result */
  dispatchAsync<D extends AbstractDispatchable>(busId: string, d: D): Promise<void>;

  /** registers an handler for a dispatchable */
  register<D extends AbstractDispatchable>(
    busId: string,
    name: D["name"],
    handler: Handler<D>,
  ): void;
}
