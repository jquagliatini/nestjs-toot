import { defineIds } from "@jqgl.cc/humanid";

export const IDS = defineIds((__) => ({
  auth: { user: __, session: __ },
  toots: { toot: __, comment: __, like: __ },
}));
