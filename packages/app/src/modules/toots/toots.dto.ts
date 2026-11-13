import { z } from "zod";

export const CreateTootDtoSchema = z.object({
  content: z.string().trim().nonempty(),
});

export type CreateTootDto = z.output<typeof CreateTootDtoSchema>;

export const TootCreatedDtoSchema = z.object({
  id: z.string().meta({ example: `77c2a038-2a90-4754-9e9d-b392bf51d771` }),
});

export type TootCreatedDto = z.output<typeof TootCreatedDtoSchema>;
