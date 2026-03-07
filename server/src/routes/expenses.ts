import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();
const router = Router();
router.use(authenticate);

async function resolveWeddingId(userId: string): Promise<string> {
  const wedding = await prisma.wedding.findUnique({ where: { userId } });
  if (!wedding) throw new AppError('Wedding not found', 404);
  return wedding.id;
}

const expenseSchema = z.object({
  category: z.string().min(1),
  description: z.string().min(1),
  estimated: z.number().min(0),
  actual: z.number().min(0).nullable().optional(),
  vendorId: z.string().nullable().optional(),
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weddingId = await resolveWeddingId(req.user!.userId);
    const expenses = await prisma.expense.findMany({
      where: { weddingId },
      include: { vendor: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: expenses });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weddingId = await resolveWeddingId(req.user!.userId);
    const data = expenseSchema.parse(req.body);
    const expense = await prisma.expense.create({
      data: { weddingId, ...data },
      include: { vendor: { select: { id: true, name: true } } },
    });
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weddingId = await resolveWeddingId(req.user!.userId);
    const existing = await prisma.expense.findFirst({ where: { id: req.params.id, weddingId } });
    if (!existing) throw new AppError('Expense not found', 404);
    const data = expenseSchema.partial().parse(req.body);
    const parsedData = { ...data };
    if (parsedData.vendorId === '') parsedData.vendorId = null as any;
    
    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: parsedData as any,
      include: { vendor: { select: { id: true, name: true } } },
    });
    res.json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weddingId = await resolveWeddingId(req.user!.userId);
    const existing = await prisma.expense.findFirst({ where: { id: req.params.id, weddingId } });
    if (!existing) throw new AppError('Expense not found', 404);
    await prisma.expense.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Expense deleted' } });
  } catch (err) {
    next(err);
  }
});

export default router;
