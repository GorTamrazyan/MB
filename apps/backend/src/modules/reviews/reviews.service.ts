import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { NotFoundError, ForbiddenError } from "../../lib/errors";

export async function createReview(
    userId: string,
    orderItemId: string,
    rating: number,
    comment?: string,
) {
    // Указываем тип для tx: Prisma.TransactionClient
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const orderItem = await tx.orderItem.findUnique({
            where: { id: orderItemId },
            include: { order: true },
        });

        if (!orderItem || orderItem.order.userId !== userId) {
            throw new ForbiddenError("You can only review your own orders");
        }

        const review = await tx.review.create({
            data: {
                userId,
                companyId: orderItem.companyId,
                orderItemId,
                rating,
                comment,
            },
        });

        return review;
    });
}

export async function getCompanyReviews(companyId: string) {
    return prisma.review.findMany({
        where: { companyId },
        include: { user: { include: { profile: true } } },
        orderBy: { createdAt: "desc" },
    });
}
