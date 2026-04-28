import { prisma } from '../../config/database';
import { getPaginationArgs, buildPaginatedResponse } from '../../lib/pagination';

export async function findAll(params: {
  page: number;
  pageSize: number;
  isVerified?: boolean;
  search?: string;
}) {
  const { skip, take } = getPaginationArgs(params);
  const where: any = {};
  if (params.isVerified !== undefined) where.isVerified = params.isVerified;
  if (params.search) {
    where.OR = [
      { companyName: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.company.findMany({
      where,
      skip,
      take,
      include: { addresses: { where: { isPrimary: true } } },
      orderBy: { averageRating: 'desc' },
    }),
    prisma.company.count({ where }),
  ]);

  return buildPaginatedResponse(data, total, params);
}

export async function findBySlug(id: string) {
  return prisma.company.findFirst({
    where: { id },
    include: {
      addresses: true,
      portfolio: { where: { isFeatured: true }, take: 6 },
      reviews: {
        where: { isApproved: true },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { include: { profile: true } } },
      },
    },
  });
}

export async function findByUserId(userId: string) {
  return prisma.company.findUnique({ where: { userId } });
}

export async function create(userId: string, data: {
  companyName: string;
  legalName: string;
  taxId?: string;
  description?: string;
  website?: string;
}) {
  return prisma.company.create({ data: { userId, ...data } });
}

export async function update(id: string, data: Partial<{
  companyName: string;
  description: string;
  logoUrl: string;
  website: string;
}>) {
  return prisma.company.update({ where: { id }, data });
}
