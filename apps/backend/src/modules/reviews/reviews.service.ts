import { prisma } from '../../config/database';
import { CreateReviewInput } from '@tina/shared';
import { ConflictError, ForbiddenError, NotFoundError } from '../../lib/errors';

export async function createReview(userId: string, input: CreateReviewInput) {
  if (input.orderId) {
    const order = await prisma.order.findUnique({ where: { id: input.orderId } });
    if (!order || order.userId !== userId) throw new ForbiddenError('Order not found');
    if (order.status !== 'COMPLETED') throw new ForbiddenError('Order must be completed to review');
  }

  const existing = await prisma.review.findFirst({
    where: { userId, companyId: input.companyId, orderId: input.orderId ?? null },
  });
  if (existing) throw new ConflictError('You already reviewed this company for this order');

  const review = await prisma.$transaction(async (tx) => {
    const r = await tx.review.create({
      data: {
        userId,
        companyId: input.companyId,
        orderId: input.orderId,
        rating: input.rating,
        title: input.title,
        comment: input.comment,
        isVerified: !!input.orderId,
      },
    });

    const agg = await tx.review.aggregate({
      where: { companyId: input.companyId, isApproved: true },
      _avg: { rating: true },
      _count: { id: true },
    });

    await tx.company.update({
      where: { id: input.companyId },
      data: {
        averageRating: agg._avg.rating ?? 0,
        totalReviews: agg._count.id,
      },
    });

    return r;
  });

  return review;
}

export async function getCompanyReviews(companyId: string, page = 1, pageSize = 10) {
  const skip = (page - 1) * pageSize;
  const [data, total] = await Promise.all([
    prisma.review.findMany({
      where: { companyId, isApproved: true },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { user: { include: { profile: { select: { firstName: true, lastName: true, avatarUrl: true } } } } },
    }),
    prisma.review.count({ where: { companyId, isApproved: true } }),
  ]);
  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function moderateReview(reviewId: string, isApproved: boolean) {
  return prisma.review.update({ where: { id: reviewId }, data: { isApproved } });
}
