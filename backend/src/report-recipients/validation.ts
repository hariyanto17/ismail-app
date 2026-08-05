import { z } from 'zod';
import { ReportType } from '@prisma/client';

export const reportRecipientSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters'),
  phone: z.string()
    .regex(/^62\d+$/, 'Phone number must start with 62 and contain digits only (no spaces, dashes, or +)'),
  report_type: z.nativeEnum(ReportType, {
    errorMap: () => ({ message: 'Invalid report type' }),
  }),
  is_active: z.boolean().optional(),
});
