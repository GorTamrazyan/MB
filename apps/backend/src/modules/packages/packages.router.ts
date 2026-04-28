import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import * as service from './packages.service';

const router = Router();

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getPackage(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/', authenticate, authorize('COMPANY'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getCompanyPackages(req.user!.userId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/', authenticate, authorize('COMPANY'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.createPackage(req.user!.userId, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
