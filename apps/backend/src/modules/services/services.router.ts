import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { serviceFiltersSchema, createServiceSchema } from '@tina/shared';
import * as service from './services.service';

const router = Router();

router.get('/', validate(serviceFiltersSchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.getServices(req.query as any);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
});

router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getServiceBySlug(req.params.slug);
    await service.recordView(data.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/', authenticate, authorize('COMPANY'), validate(createServiceSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await import('../companies/companies.service').then(m => m.getMyCompany(req.user!.userId));
    const data = await service.createService(company.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, authorize('COMPANY'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await import('../companies/companies.service').then(m => m.getMyCompany(req.user!.userId));
    const data = await service.updateService(req.params.id, company.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, authorize('COMPANY'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await import('../companies/companies.service').then(m => m.getMyCompany(req.user!.userId));
    await service.deleteService(req.params.id, company.id);
    res.json({ success: true, message: 'Service deactivated' });
  } catch (err) { next(err); }
});

export default router;
