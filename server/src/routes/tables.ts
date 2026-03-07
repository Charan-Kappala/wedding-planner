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

const tableSchema = z.object({
  name: z.string().min(1),
  capacity: z.number().int().min(1).optional(),
  posX: z.number().optional(),
  posY: z.number().optional(),
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weddingId = await resolveWeddingId(req.user!.userId);
    const tables = await prisma.table.findMany({
      where: { weddingId },
      include: { guests: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: tables });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weddingId = await resolveWeddingId(req.user!.userId);
    const data = tableSchema.parse(req.body);
    const table = await prisma.table.create({
      data: { weddingId, ...data },
      include: { guests: true },
    });
    res.status(201).json({ success: true, data: table });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weddingId = await resolveWeddingId(req.user!.userId);
    const existing = await prisma.table.findFirst({ where: { id: req.params.id, weddingId } });
    if (!existing) throw new AppError('Table not found', 404);
    const data = tableSchema.partial().parse(req.body);
    const table = await prisma.table.update({
      where: { id: req.params.id },
      data,
      include: { guests: true },
    });
    res.json({ success: true, data: table });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weddingId = await resolveWeddingId(req.user!.userId);
    const existing = await prisma.table.findFirst({ where: { id: req.params.id, weddingId } });
    if (!existing) throw new AppError('Table not found', 404);
    // Unassign guests from this table
    await prisma.guest.updateMany({ where: { tableId: req.params.id }, data: { tableId: null } });
    await prisma.table.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Table deleted' } });
  } catch (err) {
    next(err);
  }
});

export default router;
