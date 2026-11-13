import { test } from "vitest";

import { dispatchables } from "./dispatchable.js";

test(`dispatchables`, ({ expect }) => {
  const x = dispatchables({
    CreateUser: (c) => c.withPayload<{ name: string }>().withResult<{ id: string }>(),
  });

  const dispatchable = x.CreateUser({ name: `John` });
  expect(dispatchable).toEqual({
    name: `CreateUser`,
    payload: { name: `John` },
    id: expect.any(String),
  });

  expect(x.CreateUser.dispatchableName).toBe("CreateUser");
});
