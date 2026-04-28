import { Prisma } from "@prisma/client"; // Добавлено для типизации транзакций
import { prisma } from "../../config/database";
import { AppError, NotFoundError, ForbiddenError } from "../../lib/errors";
import { CheckoutInput } from "@tina/shared";
import * as cartService from "../cart/cart.service";

function generateOrderNumber(): string {
    return (
        "ORD-" +
        Date.now().toString(36).toUpperCase() +
        "-" +
        Math.random().toString(36).slice(2, 5).toUpperCase()
    );
}

export async function checkout(userId: string, input: CheckoutInput) {
    const cartItems = await cartService.getCart(userId);
    if (cartItems.length === 0) throw new AppError("Cart is empty", 400);

    const validatedItems = await cartService.validateCart(cartItems);
    if (validatedItems.length === 0)
        throw new AppError("No valid items in cart", 400);

    const totalAmount = await cartService.getCartTotal(validatedItems);

    // Добавлен тип Prisma.TransactionClient для параметра tx
    const order = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    orderNumber: generateOrderNumber(),
                    totalAmount,
                    paymentMethod: input.paymentMethod as any,
                    notes: input.notes,
                    items: {
                        create: validatedItems.map((item) => ({
                            companyId: item.companyId,
                            itemType: item.type as any,
                            itemId: item.id,
                            itemName: item.title,
                            unitPrice: item.price,
                            quantity: item.quantity,
                            totalPrice: item.price * item.quantity,
                        })),
                    },
                },
                include: { items: true },
            });
            return newOrder;
        },
    );

    await cartService.clearCart(userId);
    return order;
}

export async function getOrders(userId: string, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
        prisma.order.findMany({
            where: { userId },
            skip,
            take: pageSize,
            orderBy: { createdAt: "desc" },
            include: { items: true },
        }),
        prisma.order.count({ where: { userId } }),
    ]);
    return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}

export async function getOrderById(id: string, userId: string) {
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    company: {
                        select: { id: true, companyName: true, logoUrl: true },
                    },
                },
            },
        },
    });
    if (!order) throw new NotFoundError("Order not found");
    if (order.userId !== userId) throw new ForbiddenError();
    return order;
}

export async function updateOrderStatus(
    orderId: string,
    status: string,
    companyUserId: string,
) {
    const company = await prisma.company.findUnique({
        where: { userId: companyUserId },
    });
    if (!company) throw new ForbiddenError();

    const hasItem = await prisma.orderItem.findFirst({
        where: { orderId, companyId: company.id },
    });
    if (!hasItem)
        throw new ForbiddenError("This order does not belong to your company");

    return prisma.order.update({
        where: { id: orderId },
        data: { status: status as any },
    });
}

export async function getCompanyOrders(
    companyUserId: string,
    page = 1,
    pageSize = 10,
) {
    const company = await prisma.company.findUnique({
        where: { userId: companyUserId },
    });
    if (!company) throw new NotFoundError("Company not found");

    const orderIds = await prisma.orderItem.findMany({
        where: { companyId: company.id },
        select: { orderId: true },
        distinct: ["orderId"],
    });

    // Добавлена типизация для объекта o
    const ids = orderIds.map((o: { orderId: string }) => o.orderId);

    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
        prisma.order.findMany({
            where: { id: { in: ids } },
            skip,
            take: pageSize,
            orderBy: { createdAt: "desc" },
            include: {
                items: { where: { companyId: company.id } },
                user: { include: { profile: true } },
            },
        }),
        prisma.order.count({ where: { id: { in: ids } } }),
    ]);
    return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}
