import { z } from 'zod';

export const UserSchema = z.object({
  _id: z.string(),
  name: z.string().trim().min(1),
  externalId: z.string().trim().min(1).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateUserSchema = z.object({
  name: z.string().trim().min(1),
  externalId: z.string().trim().min(1).optional(),
});

export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
