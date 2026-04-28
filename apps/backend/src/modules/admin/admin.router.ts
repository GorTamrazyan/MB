import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { prisma } from '../../config/database';
import { cacheService } from '../../lib/cache.service';
import { CacheTTL } from '@tina/shared';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await cacheService.getOrSet('admin:stats', CacheTTL.ADMIN_STATS, async () => {
      const [users, companies, orders, revenue] = await Promise.all([
        prisma.user.count(),
        prisma.company.count(),
        prisma.order.count(),
        prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'PAID' } }),
      ]);
      return { users, companies, orders, revenue: revenue._sum.totalAmount ?? 0 };
    });
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
});

router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = 20;
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      prisma.user.findMany({ skip, take: pageSize, orderBy: { createdAt: 'desc' }, include: { profile: true } }),
      prisma.user.count(),
    ]);
    res.json({ success: true, data, total, page, totalPages: Math.ceil(total / pageSize) });
  } catch (err) { next(err); }
});

router.put('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await prisma.user.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/companies', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = 20;
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      prisma.company.findMany({ skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
      prisma.company.count(),
    ]);
    res.json({ success: true, data, total, page, totalPages: Math.ceil(total / pageSize) });
  } catch (err) { next(err); }
});

router.put('/companies/:id/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await prisma.company.update({
      where: { id: req.params.id },
      data: { isVerified: req.body.isVerified, verifiedAt: req.body.isVerified ? new Date() : null },
    });
    await cacheService.invalidate(`company:${req.params.id}`);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/reviews', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = 20;
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      prisma.review.findMany({
        skip, take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { user: { include: { profile: true } }, company: true },
      }),
      prisma.review.count(),
    ]);
    res.json({ success: true, data, total, page, totalPages: Math.ceil(total / pageSize) });
  } catch (err) { next(err); }
});

export default router;
