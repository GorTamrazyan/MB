import { z } from 'zod';
import { PriceType } from '../enums/roles.enum';

export const createServiceSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  shortDescription: z.string().max(300).optional(),
  price: z.number().positive(),
  priceType: z.nativeEnum(PriceType),
  duration: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

export const createPackageSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().optional(),
  discountPercent: z.number().min(0).max(100).default(0),
  serviceIds: z.array(z.object({
    serviceId: z.string().uuid(),
    quantity: z.number().int().positive(),
    priceOverride: z.number().positive().optional(),
  })),
});

export const serviceFiltersSchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  location: z.string().optional(),
  priceType: z.nativeEnum(PriceType).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'rating', 'newest']).default('relevance'),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type ServiceFilters = z.infer<typeof serviceFiltersSchema>;
