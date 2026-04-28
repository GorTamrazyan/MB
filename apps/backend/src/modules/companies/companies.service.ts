import { cacheService } from '../../lib/cache.service';
import { CacheTTL } from '@tina/shared';
import { NotFoundError, ForbiddenError } from '../../lib/errors';
import * as repo from './companies.repository';

export async function getCompanies(params: {
  page: number;
  pageSize: number;
  isVerified?: boolean;
  search?: string;
}) {
  const key = `companies:list:${JSON.stringify(params)}`;
  return cacheService.getOrSet(key, CacheTTL.COMPANY_LIST, () => repo.findAll(params));
}

export async function getCompanyById(id: string) {
  return cacheService.getOrSet(`company:${id}`, CacheTTL.PUBLIC_COMPANY, async () => {
    const company = await repo.findBySlug(id);
    if (!company) throw new NotFoundError('Company not found');
    return company;
  });
}

export async function getMyCompany(userId: string) {
  const company = await repo.findByUserId(userId);
  if (!company) throw new NotFoundError('Company profile not found');
  return company;
}

export async function createCompany(userId: string, data: any) {
  const existing = await repo.findByUserId(userId);
  if (existing) throw new ForbiddenError('You already have a company profile');
  return repo.create(userId, data);
}

export async function updateCompany(id: string, userId: string, data: any) {
  const company = await repo.findByUserId(userId);
  if (!company || company.id !== id) throw new ForbiddenError('Not authorized');
  const updated = await repo.update(id, data);
  await cacheService.invalidate(`company:${id}`);
  await cacheService.invalidatePattern('companies:list:*');
  return updated;
}
