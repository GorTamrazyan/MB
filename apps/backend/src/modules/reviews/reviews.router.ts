import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { createReviewSchema } from "@tina/shared";
import * as service from "./reviews.service";

const router = Router();

router.get(
    "/company/:companyId",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Теперь передаем ID компании и страницу
            const result = await service.getCompanyReviews(
                req.params.companyId,
                Number(req.query.page) || 1,
            );
            res.json({ success: true, ...result });
        } catch (err) {
            next(err);
        }
    },
);

router.post(
    "/",
    authenticate,
    validate(createReviewSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // req.user!.userId и req.body (объект с данными отзыва)
            const data = await service.createReview(req.user!.userId, req.body);
            res.status(201).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    },
);

router.put(
    "/:id/moderate",
    authenticate,
    authorize("ADMIN"),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Исправлено: передаем ID отзыва и статус модерации
            const data = await service.moderateReview(
                req.params.id,
                req.body.isApproved,
            );
            res.json({ success: true, data });
        } catch (err) {
            next(err);
        }
    },
);

export default router;
