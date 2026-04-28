import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { NotFoundError, ForbiddenError } from "../../lib/errors";

/**
 * Создание отзыва.
 * Изменено: теперь принимает объект 'data', чтобы соответствовать вызову из роутера.
 */
export async function createReview(
    userId: string,
    data: { orderItemId: string; rating: number; comment?: string },
) {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const orderItem = await tx.orderItem.findUnique({
            where: { id: data.orderItemId },
            include: { order: true },
        });

        if (!orderItem || orderItem.order.userId !== userId) {
            throw new ForbiddenError("You can only review your own orders");
        }

        const review = await tx.review.create({
            data: {
                userId,
                companyId: orderItem.companyId,
                orderItemId: data.orderItemId,
                rating: data.rating,
                comment: data.comment,
            },
        });

        return review;
    });
}

/**
 * Получение отзывов компании с пагинацией.
 */
export async function getCompanyReviews(
    companyId: string,
    page = 1,
    pageSize = 10,
) {
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
        prisma.review.findMany({
            where: { companyId },
            include: { user: { include: { profile: true } } },
            orderBy: { createdAt: "desc" },
            skip,
            take: pageSize,
        }),
        prisma.review.count({ where: { companyId } }),
    ]);

    return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}

/**
 * Модерация отзыва.
 * Добавлено для работы эндпоинта /moderate.
 */
export async function moderateReview(id: string, isApproved: boolean) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundError("Review not found");

    return prisma.review.update({
        where: { id },
        data: {
            // Убедитесь, что в вашей схеме Prisma есть поле 'status'
            status: isApproved ? "APPROVED" : "REJECTED",
        } as any,
    });
}
