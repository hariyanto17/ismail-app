import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    category_id: z.string().uuid('Invalid category ID'),
    name: z.string().min(2, 'Name must be at least 2 characters long').max(100),
    price: z.number().int().nonnegative('Price must be a positive integer'),
    is_active: z.boolean().optional(),
    image: z.string().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    category_id: z.string().uuid('Invalid category ID').optional(),
    name: z.string().min(2, 'Name must be at least 2 characters long').max(100).optional(),
    price: z.number().int().nonnegative('Price must be a positive integer').optional(),
    is_active: z.boolean().optional(),
    image: z.string().optional(),
  }),
});
