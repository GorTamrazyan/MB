import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import * as service from './categories.service';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getCategoryTree();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.createCategory(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
