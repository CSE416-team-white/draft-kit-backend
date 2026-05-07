import { z } from 'zod';

export const AuthProviderSchema = z.enum(['google']);

export const UserSchema = z.object({
  _id: z.string(),
  name: z.string().trim().min(1),
  email: z.string().email().optional(),
  authProvider: AuthProviderSchema.optional(),
  providerSubject: z.string().trim().min(1).optional(),
  avatarUrl: z.string().trim().min(1).nullable().optional(),
  externalId: z.string().trim().min(1).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateUserSchema = z.object({
  name: z.string().trim().min(1),
  externalId: z.string().trim().min(1).optional(),
});

export const UpsertProviderUserSchema = z.object({
  authProvider: AuthProviderSchema,
  providerSubject: z.string().trim().min(1),
  email: z.string().email(),
  name: z.string().trim().min(1),
  avatarUrl: z.string().trim().min(1).nullable().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpsertProviderUserInput = z.infer<typeof UpsertProviderUserSchema>;
