import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as service from './notifications.service';

const router = Router();

router.use(authenticate);

router.get('/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  service.registerSSEClient(req.user!.userId, res);
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.getNotifications(req.user!.userId, Number(req.query.page) || 1);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
});

router.put('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.markRead(req.params.id, req.user!.userId);
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.put('/read-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.markAllRead(req.user!.userId);
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
