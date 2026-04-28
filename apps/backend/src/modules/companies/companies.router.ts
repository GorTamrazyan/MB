import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import * as service from './companies.service';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getCompanies({
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 20,
      search: req.query.search as string | undefined,
      isVerified: req.query.verified === 'true' ? true : undefined,
    });
    res.json({ success: true, ...data });
  } catch (err) { next(err); }
});

router.get('/me', authenticate, authorize('COMPANY'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getMyCompany(req.user!.userId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getCompanyById(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/', authenticate, authorize('COMPANY'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.createCompany(req.user!.userId, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, authorize('COMPANY'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.updateCompany(req.params.id, req.user!.userId, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
