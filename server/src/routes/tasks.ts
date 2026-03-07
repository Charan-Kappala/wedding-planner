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

const taskSchema = z.object({
  title: z.string().min(1),
  dueDate: z.string().nullable().optional(),
  completed: z.boolean().optional(),
  category: z.string().nullable().optional(),
  assignee: z.string().nullable().optional(),
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weddingId = await resolveWeddingId(req.user!.userId);
    const tasks = await prisma.task.findMany({
      where: { weddingId },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
    });
    res.json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weddingId = await resolveWeddingId(req.user!.userId);
    const data = taskSchema.parse(req.body);
    const task = await prisma.task.create({
      data: {
        weddingId,
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weddingId = await resolveWeddingId(req.user!.userId);
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, weddingId } });
    if (!existing) throw new AppError('Task not found', 404);
    const data = taskSchema.partial().parse(req.body);
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...data,
        dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
      },
    });
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weddingId = await resolveWeddingId(req.user!.userId);
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, weddingId } });
    if (!existing) throw new AppError('Task not found', 404);
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Task deleted' } });
  } catch (err) {
    next(err);
  }
});

// Bulk create tasks (for seeding checklist template)
router.post('/bulk', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weddingId = await resolveWeddingId(req.user!.userId);
    const tasks = z.array(taskSchema).parse(req.body);
    await prisma.task.createMany({
      data: tasks.map((t) => ({
        weddingId,
        ...t,
        dueDate: t.dueDate ? new Date(t.dueDate) : null,
      })),
    });
    const all = await prisma.task.findMany({ where: { weddingId }, orderBy: { createdAt: 'asc' } });
    res.status(201).json({ success: true, data: all });
  } catch (err) {
    next(err);
  }
});

export default router;
