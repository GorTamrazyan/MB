import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { prisma } from '../../config/database';

const router = Router();

router.use(authenticate);

router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raw = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { profile: true },
    });
    if (!raw) { res.json({ success: true, data: null }); return; }
    const { passwordHash, refreshTokenHash, verificationToken, resetPasswordToken, ...user } = raw;
    void passwordHash; void refreshTokenHash; void verificationToken; void resetPasswordToken;
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

router.put('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await prisma.userProfile.update({
      where: { userId: req.user!.userId },
      data: req.body,
    });
    res.json({ success: true, data: profile });
  } catch (err) { next(err); }
});

export default router;
