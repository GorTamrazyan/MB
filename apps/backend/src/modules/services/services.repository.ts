import { prisma } from '../../config/database';
import { getPaginationArgs, buildPaginatedResponse } from '../../lib/pagination';
import { ServiceFilters } from '@tina/shared';

export async function findMany(filters: ServiceFilters) {
  const { skip, take } = getPaginationArgs({ page: filters.page, pageSize: filters.pageSize });

  const where: any = { isActive: true };

  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.companyId) where.companyId = filters.companyId;
  if (filters.priceType) where.priceType = filters.priceType;
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
  }
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: 'insensitive' } },
      { description: { contains: filters.q, mode: 'insensitive' } },
    ];
  }

  const orderBy: any = {};
  switch (filters.sortBy) {
    case 'price_asc': orderBy.price = 'asc'; break;
    case 'price_desc': orderBy.price = 'desc'; break;
    case 'newest': orderBy.createdAt = 'desc'; break;
    default: orderBy.viewsCount = 'desc';
  }

  const [data, total] = await Promise.all([
    prisma.service.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        company: { select: { id: true, companyName: true, logoUrl: true, isVerified: true, averageRating: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.service.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, { page: filters.page, pageSize: filters.pageSize });
}

export async function findBySlug(slug: string) {
  return prisma.service.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: 'asc' } },
      company: {
        include: {
          addresses: { where: { isPrimary: true } },
        },
      },
      category: true,
    },
  });
}

export async function findById(id: string) {
  return prisma.service.findUnique({
    where: { id },
    include: { images: true, company: true },
  });
}

export async function create(companyId: string, data: {
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  priceType: any;
  duration?: string;
}) {
  return prisma.service.create({
    data: { companyId, ...data },
    include: { images: true },
  });
}

export async function update(id: string, data: any) {
  return prisma.service.update({ where: { id }, data });
}

export async function softDelete(id: string) {
  return prisma.service.update({ where: { id }, data: { isActive: false } });
}

export async function incrementViews(id: string, amount: number) {
  return prisma.service.update({
    where: { id },
    data: { viewsCount: { increment: amount } },
  });
}
