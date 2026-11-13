import { z } from "zod";

const UsernameSchema = z.string().trim().nonempty().brand(`Auth/Username`);
export type Username = z.output<typeof UsernameSchema>;

export function makeUsername(username: string): Username {
  return UsernameSchema.parse(username);
}
