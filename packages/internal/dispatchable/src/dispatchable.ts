type JsonifiablePrimitive = number | string | undefined | null;
type Jsonifiable =
  | JsonifiablePrimitive
  | JsonifiablePrimitive[]
  | {
      [id: string]: Jsonifiable | Jsonifiable[];
    };

const RETURN_TYPE = Symbol();
export type Dispatchable<N extends string, P extends Jsonifiable, R extends Promise<unknown>> = {
  id: string;
  name: N;
  payload: P;
  [RETURN_TYPE]: R;
};

export type DispatchableBuilder<N extends string> = {
  withPayload<P extends Jsonifiable>(): {
    withResult<R>(): (payload: P) => Dispatchable<N, P, Promise<R>>;
  };
};

export type AbstractDispatchable = Dispatchable<string, any, any>;
export type AbstractDispatchableDictionary = Record<
  string,
  (b: DispatchableBuilder<string>) => (p: any) => AbstractDispatchable
>;

export function makeDispatchable<const N extends string>(name: N): DispatchableBuilder<N> {
  return {
    withPayload: <P extends Jsonifiable>() => ({
      withResult:
        <R>() =>
        (payload: P) =>
          ({ id: crypto.randomUUID(), name, payload }) as unknown as Dispatchable<N, P, Promise<R>>,
    }),
  };
}

export function dispatchables<O extends AbstractDispatchableDictionary>(
  options: O,
): {
  [K in Extract<keyof O, string>]: O[K] extends (
    b: any,
  ) => (p: any) => Dispatchable<string, infer P, infer R>
    ? ((payload: P) => Dispatchable<K, P, R>) & {
        dispatchableName: K;
        $type: Dispatchable<K, P, R>;
        $result: R;
        $payload: P;
      }
    : ((payload: any) => AbstractDispatchable) & { name: string };
} {
  return Object.fromEntries(
    Object.entries(options).map(([k, f]) => {
      const dispatchable = typeof f === "function" ? f(makeDispatchable(k)) : f;
      return [k, Object.assign(dispatchable, { dispatchableName: k })];
    }),
  ) as any;
}
