import { cacheService } from '../../lib/cache.service';
import { CacheTTL, ServiceFilters, CreateServiceInput } from '@tina/shared';
import { NotFoundError, ForbiddenError } from '../../lib/errors';
import { slugify } from '../../lib/slugify';
import { redis } from '../../config/redis';
import * as repo from './services.repository';

// Batch view count flush every 5 minutes
const VIEW_BUFFER: Record<string, number> = {};

export function startViewFlush() {
  setInterval(async () => {
    const entries = Object.entries(VIEW_BUFFER);
    if (entries.length === 0) return;
    for (const [id, count] of entries) {
      delete VIEW_BUFFER[id];
      await repo.incrementViews(id, count).catch(() => {});
    }
  }, 5 * 60 * 1000);
}

export async function getServices(filters: ServiceFilters) {
  const key = `services:list:${JSON.stringify(filters)}`;
  return cacheService.getOrSet(key, CacheTTL.SERVICE_LIST, () => repo.findMany(filters));
}

export async function getServiceBySlug(slug: string) {
  return cacheService.getOrSet(`service:${slug}`, CacheTTL.PUBLIC_SERVICE, async () => {
    const service = await repo.findBySlug(slug);
    if (!service) throw new NotFoundError('Service not found');
    return service;
  });
}

export async function recordView(serviceId: string) {
  VIEW_BUFFER[serviceId] = (VIEW_BUFFER[serviceId] || 0) + 1;
}

export async function createService(companyId: string, input: CreateServiceInput) {
  const slug = slugify(input.title) + '-' + Date.now();
  const service = await repo.create(companyId, { ...input, price: input.price, slug });
  await cacheService.invalidatePattern('services:list:*');
  return service;
}

export async function updateService(id: string, companyId: string, data: any) {
  const service = await repo.findById(id);
  if (!service) throw new NotFoundError('Service not found');
  if (service.companyId !== companyId) throw new ForbiddenError('Not authorized');

  const updated = await repo.update(id, data);
  await cacheService.invalidate(`service:${service.slug}`);
  await cacheService.invalidatePattern('services:list:*');
  return updated;
}

export async function deleteService(id: string, companyId: string) {
  const service = await repo.findById(id);
  if (!service) throw new NotFoundError('Service not found');
  if (service.companyId !== companyId) throw new ForbiddenError('Not authorized');

  await repo.softDelete(id);
  await cacheService.invalidate(`service:${service.slug}`);
  await cacheService.invalidatePattern('services:list:*');
}
