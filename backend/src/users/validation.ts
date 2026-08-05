import { z } from 'zod';
import { Role } from '@prisma/client';

export const createUserSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(6).max(100),
    full_name: z.string().min(2).max(100),
    role: z.nativeEnum(Role),
    is_active: z.boolean().optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50).optional(),
    password: z.string().min(6).max(100).optional(),
    full_name: z.string().min(2).max(100).optional(),
    role: z.nativeEnum(Role).optional(),
    is_active: z.boolean().optional(),
  }),
});
