import { faker } from "@faker-js/faker";
import z from "zod";

import { test } from "#/fixtures.js";

test(`auth signup`, async ({ anonymous, expect }) => {
  const username = faker.internet.username();
  const email = faker.internet.email();
  const password =
    faker.string.alphanumeric({
      casing: "mixed",
      length: 20,
    }) + "$";

  const { response, data } = await anonymous.sdk.auth.signup({
    body: { username, email, password },
  });

  expect(response?.status).toBe(201);
  expect(data).toMatchObject(
    expect.schemaMatching(
      z.object({
        token: z.string().nonempty(),
        expiresAt: z.iso.datetime({ local: false }),
      }),
    ),
  );
});

test(`auth signin`, async ({ anonymous, user, expect }) => {
  const { response, data } = await anonymous.sdk.auth.signin({
    body: { email: user.email, password: user.password },
  });

  expect(response?.status).toBe(201);
  expect(data).toMatchObject(
    expect.schemaMatching(
      z.object({ token: z.string().nonempty(), expiresAt: z.iso.datetime({ local: false }) }),
    ),
  );
});
