import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { getWedding, updateWedding } from '../services/weddingService';

const router = Router();
router.use(authenticate);

const updateSchema = z.object({
  date: z.string().nullable().optional(),
  venueName: z.string().nullable().optional(),
  venueAddress: z.string().nullable().optional(),
  budget: z.number().min(0).optional(),
  partner1Name: z.string().nullable().optional(),
  partner2Name: z.string().nullable().optional(),
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wedding = await getWedding(req.user!.userId);
    res.json({ success: true, data: wedding });
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateSchema.parse(req.body);
    const wedding = await updateWedding(req.user!.userId, data);
    res.json({ success: true, data: wedding });
  } catch (err) {
    next(err);
  }
});

export default router;
