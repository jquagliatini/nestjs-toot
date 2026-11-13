import * as assert from "node:assert/strict";

export const HUMANID = Symbol();
type IdDefinition = {
  [id: string]: typeof HUMANID | IdDefinition;
};

export type Id<Brand extends string> = string & { [HUMANID]: Brand };
function makeId<const Brand extends string>(value?: string): Id<Brand> {
  return (value || crypto.randomUUID()) as Id<Brand>;
}

type IdFactory<Brand extends string> = ((value?: string) => Id<Brand>) & {
  $type: Id<Brand>;
};

type Concat<Id extends string, Prefix extends string = ""> = Prefix extends ""
  ? Id
  : `${Prefix}/${Id}`;

type Ids<T extends IdDefinition, Prefix extends string = ""> = {
  [K in Extract<keyof T, string>]: T[K] extends typeof HUMANID
    ? IdFactory<Concat<K, Prefix>>
    : T[K] extends IdDefinition
      ? Ids<T[K], Concat<K, Prefix>>
      : never;
};

function traverseDefinition(entries: IdDefinition, depth = 1): Record<string, unknown> {
  assert.ok(depth <= 10, `id definition has depth > 10`);
  return Object.fromEntries(
    Object.entries(entries).map(([k, v]) =>
      v === HUMANID ? [k, makeId] : [k, traverseDefinition(v, depth + 1)],
    ),
  );
}

export function defineIds<T extends IdDefinition>(factory: (helper: typeof HUMANID) => T): Ids<T> {
  return traverseDefinition(factory(HUMANID)) as any;
}
