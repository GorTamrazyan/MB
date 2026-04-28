import { prisma } from '../../config/database';
import { cacheService } from '../../lib/cache.service';
import { CacheTTL } from '@tina/shared';

export async function getCategoryTree() {
  return cacheService.getOrSet('categories:tree', CacheTTL.CATEGORY_TREE, async () => {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: { children: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
    return categories;
  });
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string;
  order?: number;
}) {
  const category = await prisma.category.create({ data });
  await cacheService.invalidate('categories:tree');
  return category;
}

export async function updateCategory(id: string, data: Partial<{ name: string; description: string; icon: string; order: number }>) {
  const category = await prisma.category.update({ where: { id }, data });
  await cacheService.invalidate('categories:tree');
  return category;
}
