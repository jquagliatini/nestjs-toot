import assert from "node:assert";
import { inspect } from "node:util";

import { faker } from "@faker-js/faker";
import { Sdk } from "@jqgl.cc/app.sdk";
import { createClient, createConfig } from "@jqgl.cc/app.sdk/client";
import { test as base, inject } from "vitest";

export const test = base
  .extend("baseUrl", () => `http://localhost:${inject("port")}`)
  .extend("anonymous", ({ baseUrl }) => {
    const sdk = new Sdk({
      client: createClient(createConfig({ baseUrl })),
    });

    return { sdk };
  })
  .extend("user", async ({ anonymous, baseUrl }) => {
    const username = faker.internet.username();
    const email = faker.internet.email({
      lastName: `${username.toLowerCase()}+${crypto.randomUUID()}`,
    });
    const password =
      faker.string.alphanumeric({
        casing: "mixed",
        length: 20,
      }) + "$Ab1";

    const { response, data, error } = await anonymous.sdk.auth.signup({
      body: { email, password, username },
    });

    assert.ok(response?.status === 201, `could not create a new user: ${inspect(error)}`);
    assert.ok(data, `could not retrieve user data from sign-up endpoint`);

    const sdk = new Sdk({
      client: createClient(
        createConfig({
          baseUrl,
          headers: { authorization: `bearer ${data.token}` },
        }),
      ),
    });

    const { id, ...token } = data;
    return {
      id,
      email,
      username,
      password,

      token: { ...token, expiresAt: new Date(token.expiresAt) },

      sdk,
    };
  });

export { describe, expect, expectTypeOf } from "vitest";
