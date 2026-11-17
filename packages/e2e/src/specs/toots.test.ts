import * as assert from "node:assert";

import { z } from "zod";

import { test } from "#/fixtures.js";

test(`lists toots`, async ({ anonymous, expect }) => {
  const { response, data } = await anonymous.sdk.toots.listToots();

  expect(response?.status).toBe(200);
  expect(data).toMatchObject(
    expect.schemaMatching(
      z.object({
        items: z.array(z.any()),
        totalCount: z.int().gte(0),
      }),
    ),
  );
});

test(`creates a toot`, async ({ user, expect }) => {
  const { response: createTootResponse, data: createdToot } = await user.sdk.toots.createToot({
    body: { content: `this is a toot` },
  });

  expect(createTootResponse?.status).toBe(201);
  expect(createdToot).toEqual({ id: expect.any(String) });

  const { response: detailTootResponse, data: detailedToot } = await user.sdk.toots.detailToot({
    path: { id: createdToot!.id },
  });

  expect(detailTootResponse?.status).toBe(200);
  expect(detailedToot?.content).toBe(`this is a toot`);
});

test(`anonymous can't create a toot`, async ({ anonymous, expect }) => {
  const { response } = await anonymous.sdk.toots.createToot({
    body: { content: `this is a toot` },
  });
  expect(response?.status).toBe(404);
});

test.describe("given an existing toot", () => {
  let toot: { id: string };

  test.beforeEach(async ({ user, expect }) => {
    toot = await user.sdk.toots
      .createToot({
        body: { content: `this is a toot ${crypto.randomUUID()}` },
      })
      .then(({ response, data }) => {
        expect(response?.status).toBe(201);
        assert.ok(data);
        return data;
      });
  });

  test(`comments on toot`, async ({ user, expect }) => {
    await user.sdk.toots
      .comment({
        path: { id: toot.id },
        body: { content: `this is a comment` },
      })
      .then(({ response }) => {
        expect(response?.status).toBe(201);
      });

    const detailedToot = await user.sdk.toots
      .detailToot({ path: { id: toot.id } })
      .then(({ response, data }) => {
        expect(response?.status).toBe(200);
        assert.ok(data);
        return data;
      });

    expect(detailedToot).toMatchObject({
      comments: {
        items: [
          {
            content: "this is a comment",
            createdAt: expect.schemaMatching(z.iso.datetime({ local: false })),
            author: { id: user.id, username: user.username },
            connectedUser: { author: true },
          },
        ],
        totalCount: 1,
      },
    });
  });

  test(`anonymous can't comment on a toot`, async ({ anonymous, expect }) => {
    const { response } = await anonymous.sdk.toots.comment({
      path: { id: toot.id },
      body: { content: `this is a comment` },
    });
    expect(response?.status).toBe(404);
  });

  test(`likes a toot once`, async ({ user, expect }) => {
    await user.sdk.toots.like({ path: { id: toot.id } }).then(({ response }) => {
      expect(response?.status).toBe(204);
    });
    await user.sdk.toots.like({ path: { id: toot.id } }).then(({ response }) => {
      expect(response?.status).toBe(204);
    });

    const detailedToot = await user.sdk.toots
      .detailToot({ path: { id: toot.id } })
      .then(({ response, data }) => {
        expect(response?.status).toBe(200);
        assert.ok(data);
        return data;
      });

    expect(detailedToot.likesCount).toBe(1);
  });

  test(`anonymous can't like a toot`, async ({ anonymous, expect }) => {
    const { response } = await anonymous.sdk.toots.like({
      path: { id: toot.id },
    });
    expect(response?.status).toBe(404);
  });

  test(`unlikes a toot`, async ({ user, expect }) => {
    await user.sdk.toots.like({ path: { id: toot.id } });
    const detailedToot = await user.sdk.toots
      .detailToot({ path: { id: toot.id } })
      .then(({ data }) => {
        assert.ok(data);
        return data;
      });

    expect(detailedToot.likesCount).toBe(1);

    await user.sdk.toots.unlike({ path: { id: toot.id } });
    const updatedToot = await user.sdk.toots
      .detailToot({ path: { id: toot.id } })
      .then(({ data }) => {
        assert.ok(data);
        return data;
      });

    expect(updatedToot.likesCount).toBe(0);
  });

  test(`anonymous can't un-like a toot`, async ({ anonymous, expect }) => {
    const { response } = await anonymous.sdk.toots.unlike({
      path: { id: toot.id },
    });
    expect(response?.status).toBe(404);
  });
});
