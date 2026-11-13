import * as assert from "node:assert";

import { z } from "zod";

export function isDefined<T>(value: T): value is NonNullable<T> {
  return value !== undefined && value !== null;
}

export function assertIsDefined<T>(value: T, message?: string): NonNullable<T> {
  assert.ok(isDefined(value), message ?? `expected defined value`);
  return value;
}

export type Pretty<T> = { [K in keyof T]: T[K] } & {};

export type Pascal<T extends string> = T extends `${infer Head}${infer Tail}`
  ? `${Capitalize<Head>}${Tail}`
  : T;

const SECONDS = 1_000;
const MINUTES = 60 * SECONDS;
const HOURS = 60 * MINUTES;
export const time = { SECONDS, MINUTES, HOURS };

export const datetimeCodec = z.codec(z.date(), z.iso.datetime(), {
  encode: (d) => new Date(d),
  decode: (d) => d.toISOString(),
});
