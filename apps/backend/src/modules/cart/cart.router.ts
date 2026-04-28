import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as cartService from './cart.service';
import * as ordersService from '../orders/orders.service';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await cartService.getCart(req.user!.userId);
    const total = await cartService.getCartTotal(items);
    res.json({ success: true, data: { items, total } });
  } catch (err) { next(err); }
});

router.post('/items', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await cartService.addItem(req.user!.userId, req.body);
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
});

router.put('/items/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await cartService.updateItem(req.user!.userId, req.params.itemId, req.body.quantity);
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
});

router.delete('/items/:itemId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await cartService.removeItem(req.user!.userId, req.params.itemId);
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
});

router.delete('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await cartService.clearCart(req.user!.userId);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) { next(err); }
});

router.post('/checkout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await ordersService.checkout(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: order });
  } catch (err) { next(err); }
});

export default router;
