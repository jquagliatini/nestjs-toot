import assert from "node:assert";

import { faker } from "@faker-js/faker";
import { type Auth, type Health, Sdk } from "@jqgl.cc/app.sdk";
import { createClient, createConfig } from "@jqgl.cc/app.sdk/client";
import { test as base, inject } from "vitest";

export const test = base
  .extend("baseUrl", () => `http://localhost:${inject("port")}`)
  .extend("anonymous", ({ baseUrl }) => {
    const sdk: { health: Health; auth: Auth } = new Sdk({
      client: createClient(createConfig({ baseUrl })),
    });

    return { sdk };
  })
  .extend("user", async ({ anonymous, baseUrl }) => {
    const username = faker.internet.username();
    const email = faker.internet.email();
    const password =
      faker.string.alphanumeric({
        casing: "mixed",
        length: 20,
      }) + "$";

    const { response, data } = await anonymous.sdk.auth.signup({
      body: { email, password, username },
    });

    assert.ok(response?.status === 201, `could not create a new user`);

    const sdk = new Sdk({
      client: createClient(
        createConfig({
          baseUrl,
          headers: { authorization: `bearer ${data!.token}` },
        }),
      ),
    });

    return { email, username, password, sdk, token: data! };
  });

export { describe, expect, expectTypeOf } from "vitest";
