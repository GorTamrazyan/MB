import { z } from 'zod';
import { PaymentMethod } from '../enums/roles.enum';

export const checkoutSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod),
  notes: z.string().max(1000).optional(),
});

export const createReviewSchema = z.object({
  companyId: z.string().uuid(),
  orderId: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  comment: z.string().max(2000).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
