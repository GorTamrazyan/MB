import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import * as service from './orders.service';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.getOrders(req.user!.userId, Number(req.query.page) || 1);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
});

router.get('/company', authorize('COMPANY'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.getCompanyOrders(req.user!.userId, Number(req.query.page) || 1);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getOrderById(req.params.id, req.user!.userId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.put('/:id/status', authorize('COMPANY', 'ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.updateOrderStatus(req.params.id, req.body.status, req.user!.userId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
