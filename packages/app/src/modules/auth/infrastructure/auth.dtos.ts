import { z } from "zod";

import { datetimeCodec } from "#/utils.js";

export const AuthSignupDtoSchema = z
  .object({
    email: z.email(),
    password: z.string(),
    username: z.string().trim().nonempty(),
  })
  .meta({ name: "AuthSessionDto" });

export type AuthSignupDto = z.input<typeof AuthSignupDtoSchema>;

export const AuthSessionDtoSchema = z.object({
  token: z.string(),
  expiresAt: datetimeCodec,
});

export type AuthSessionDto = z.input<typeof AuthSessionDtoSchema>;

export const AuthSigninDtoSchema = z.object({ email: z.email(), password: z.string() });
export type AuthSigninDto = z.input<typeof AuthSigninDtoSchema>;
