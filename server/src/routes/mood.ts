import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();
const router = Router();
router.use(authenticate);

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'mood');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype))
      cb(null, true);
    else cb(new Error('Only image files (JPG, PNG, WebP, GIF) are allowed'));
  },
});

async function resolveWeddingId(userId: string): Promise<string> {
  const wedding = await prisma.wedding.findUnique({ where: { userId } });
  if (!wedding) throw new AppError('Wedding not found', 404);
  return wedding.id;
}

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weddingId = await resolveWeddingId(req.user!.userId);
    const images = await prisma.moodImage.findMany({
      where: { weddingId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    res.json({ success: true, data: images });
  } catch (err) {
    next(err);
  }
});

// Upload an image file
router.post('/upload', upload.single('image'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weddingId = await resolveWeddingId(req.user!.userId);
    if (!req.file) throw new AppError('No file uploaded', 400);
    const { tag } = z.object({ tag: z.string().optional() }).parse(req.body);
    const image = await prisma.moodImage.create({
      data: {
        weddingId,
        url: `/uploads/mood/${req.file.filename}`,
        filename: req.file.originalname,
        tag: tag ?? null,
      },
    });
    res.status(201).json({ success: true, data: image });
  } catch (err) {
    next(err);
  }
});

// Add by URL
router.post('/url', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weddingId = await resolveWeddingId(req.user!.userId);
    const { url, tag } = z.object({ url: z.string().url(), tag: z.string().optional() }).parse(req.body);
    const image = await prisma.moodImage.create({ data: { weddingId, url, tag: tag ?? null } });
    res.status(201).json({ success: true, data: image });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weddingId = await resolveWeddingId(req.user!.userId);
    const existing = await prisma.moodImage.findFirst({ where: { id: req.params.id, weddingId } });
    if (!existing) throw new AppError('Image not found', 404);
    const data = z.object({ tag: z.string().nullable().optional(), sortOrder: z.number().optional() }).parse(req.body);
    const image = await prisma.moodImage.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: image });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weddingId = await resolveWeddingId(req.user!.userId);
    const existing = await prisma.moodImage.findFirst({ where: { id: req.params.id, weddingId } });
    if (!existing) throw new AppError('Image not found', 404);
    await prisma.moodImage.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Image deleted' } });
  } catch (err) {
    next(err);
  }
});

export default router;
