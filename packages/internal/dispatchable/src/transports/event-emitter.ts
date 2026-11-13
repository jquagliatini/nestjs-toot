import * as assert from "node:assert";
import { EventEmitter } from "node:events";

import type { AbstractDispatchable, Dispatchable } from "../dispatchable.js";
import type { DispatchableTransport } from "../transport.js";

export class EventEmitterDispatchableTransport implements DispatchableTransport {
  private isClosed = true;
  private readonly ee = new EventEmitter();
  private readonly handlers = new Set<string>();

  forceClose(): void {
    this.isClosed = true;
    this.ee.removeAllListeners();
  }

  async open(): Promise<void> {
    this.isClosed = false;
  }

  async close(): Promise<void> {
    // noop
  }

  dispatch<D extends AbstractDispatchable>(
    busId: string,
    d: D,
  ): D extends Dispatchable<string, any, infer R> ? R : Promise<unknown> {
    assert.ok(!this.isClosed, `[${this.constructor.name}] close`);

    return new Promise((resolve, reject) => {
      this.ee.once(`${busId}/${d.name}/${d.id}/result`, (result) => {
        resolve(result);
      });

      this.ee.once(`${busId}/${d.name}/${d.id}/error`, (error) => {
        reject(error);
      });

      if (!this.ee.emit(`${busId}/${d.name}`, d)) {
        throw new Error(`no handler defined for ${busId}/${d.name}`);
      }
    }) as any;
  }

  async dispatchAsync<D extends AbstractDispatchable>(busId: string, d: D): Promise<void> {
    assert.ok(!this.isClosed, `[${this.constructor.name}] close`);

    this.ee.emit(`${busId}/${d.name}`, d);
  }

  register<D extends AbstractDispatchable>(
    busId: string,
    name: D["name"],
    handler: D extends Dispatchable<string, any, infer R extends Promise<unknown>>
      ? (d: D) => R
      : (d: D) => Promise<unknown>,
  ): void {
    const eventName = `${busId}/${name}`;

    assert.ok(
      !this.handlers.has(eventName),
      `[${this.constructor.name}] ${eventName} handler already registered`,
    );

    this.ee.addListener(eventName, async (dispatchable: AbstractDispatchable) => {
      try {
        const result = await handler(dispatchable);
        this.ee.emit(`${eventName}/${dispatchable.id}/result`, result);
      } catch (e) {
        this.ee.emit(`${eventName}/${dispatchable.id}/error`, e);
      }
    });
  }

  [Symbol.asyncDispose](): PromiseLike<void> {
    return this.close();
  }
}
