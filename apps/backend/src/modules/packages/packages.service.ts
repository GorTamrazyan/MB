import { prisma } from "../../config/database";
import { NotFoundError, ForbiddenError } from "../../lib/errors";
import { slugify } from "../../lib/slugify";
import { cacheService } from "../../lib/cache.service";
import { Prisma } from "@prisma/client"; // Добавлено для доступа к типам моделей

export async function createPackage(
    companyUserId: string,
    data: {
        name: string;
        description?: string;
        discountPercent: number;
        serviceIds: Array<{
            serviceId: string;
            quantity: number;
            priceOverride?: number;
        }>;
    },
) {
    const company = await prisma.company.findUnique({
        where: { userId: companyUserId },
    });
    if (!company) throw new ForbiddenError("Company profile not found");

    // Добавлена типизация для 's' в map
    const services = await prisma.service.findMany({
        where: {
            id: {
                in: data.serviceIds.map(
                    (s: { serviceId: string }) => s.serviceId,
                ),
            },
            companyId: company.id,
        },
    });

    // Исправлены ошибки TS7006: добавлена типизация для 'sum' и 's'
    const totalPrice = services.reduce((sum: number, s: any) => {
        const override = data.serviceIds.find(
            (si) => si.serviceId === s.id,
        )?.priceOverride;
        const qty =
            data.serviceIds.find((si) => si.serviceId === s.id)?.quantity || 1;
        return sum + (override ?? Number(s.price)) * qty;
    }, 0);

    const finalPrice = totalPrice * (1 - data.discountPercent / 100);
    const slug = slugify(data.name) + "-" + Date.now();

    const pkg = await prisma.package.create({
        data: {
            companyId: company.id,
            name: data.name,
            slug,
            description: data.description,
            discountPercent: data.discountPercent,
            totalPrice,
            finalPrice,
            services: {
                create: data.serviceIds.map((si) => ({
                    serviceId: si.serviceId,
                    quantity: si.quantity,
                    priceOverride: si.priceOverride,
                })),
            },
        },
        include: { services: { include: { service: true } } },
    });

    return pkg;
}

export async function getPackage(id: string) {
    return cacheService.getOrSet(`package:${id}`, 600, async () => {
        const pkg = await prisma.package.findUnique({
            where: { id },
            include: {
                services: {
                    include: {
                        service: {
                            include: {
                                images: { where: { isPrimary: true } },
                            },
                        },
                    },
                },
                company: true,
            },
        });
        if (!pkg) throw new NotFoundError("Package not found");
        return pkg;
    });
}

export async function getCompanyPackages(companyUserId: string) {
    const company = await prisma.company.findUnique({
        where: { userId: companyUserId },
    });
    if (!company) throw new ForbiddenError();

    return prisma.package.findMany({
        where: { companyId: company.id },
        include: { services: { include: { service: true } } },
        orderBy: { createdAt: "desc" },
    });
}
