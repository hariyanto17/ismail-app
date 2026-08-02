import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

export const createTransactionSchema = z.object({
  body: z.object({
    payment_method: z.nativeEnum(PaymentMethod, {
      errorMap: () => ({ message: "Payment method must be CASH or QRIS" }),
    }),
    paid_amount: z.number().int().nonnegative('Paid amount must be at least 0'),
    items: z.array(
      z.object({
        product_id: z.string().uuid('Invalid product ID'),
        qty: z.number().int().positive('Quantity must be at least 1'),
      })
    ).min(1, 'Transaction must contain at least one item'),
  }),
});
