import { defineIds } from "@jqgl.cc/humanid";

export const IDS = defineIds((__) => ({
  auth: { user: __, session: __ },
  toots: { toot: __, comment: __, like: __ },
}));

declare module "@jqgl.cc/humanid" {
  export interface Registry {
    ids: typeof IDS;
  }
}
