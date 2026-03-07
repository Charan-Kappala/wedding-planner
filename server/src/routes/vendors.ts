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

// ─── Multer setup for contract uploads ────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'contracts');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  },
});

async function resolveWeddingId(userId: string): Promise<string> {
  const wedding = await prisma.wedding.findUnique({ where: { userId } });
  if (!wedding) throw new AppError('Wedding not found', 404);
  return wedding.id;
}

const vendorSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  contact: z.string().nullable().optional(),
  price: z.number().min(0).nullable().optional(),
  status: z.enum(['INQUIRY', 'BOOKED', 'PAID', 'CANCELLED']).optional(),
  notes: z.string().nullable().optional(),
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weddingId = await resolveWeddingId(req.user!.userId);
    const vendors = await prisma.vendor.findMany({
      where: { weddingId },
      include: { files: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: vendors });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weddingId = await resolveWeddingId(req.user!.userId);
    const data = vendorSchema.parse(req.body);
    const vendor = await prisma.vendor.create({
      data: { weddingId, ...data },
      include: { files: true },
    });
    res.status(201).json({ success: true, data: vendor });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weddingId = await resolveWeddingId(req.user!.userId);
    const existing = await prisma.vendor.findFirst({ where: { id: req.params.id, weddingId } });
    if (!existing) throw new AppError('Vendor not found', 404);
    const data = vendorSchema.partial().parse(req.body);
    const vendor = await prisma.vendor.update({
      where: { id: req.params.id },
      data,
      include: { files: true },
    });
    res.json({ success: true, data: vendor });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weddingId = await resolveWeddingId(req.user!.userId);
    const existing = await prisma.vendor.findFirst({ where: { id: req.params.id, weddingId } });
    if (!existing) throw new AppError('Vendor not found', 404);
    await prisma.vendor.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Vendor deleted' } });
  } catch (err) {
    next(err);
  }
});

// File upload for vendor contract
router.post('/:id/files', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const weddingId = await resolveWeddingId(req.user!.userId);
    const existing = await prisma.vendor.findFirst({ where: { id: req.params.id, weddingId } });
    if (!existing) throw new AppError('Vendor not found', 404);
    if (!req.file) throw new AppError('No file uploaded', 400);

    const fileRecord = await prisma.file.create({
      data: {
        vendorId: req.params.id,
        url: `/uploads/contracts/${req.file.filename}`,
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
      },
    });
    res.status(201).json({ success: true, data: fileRecord });
  } catch (err) {
    next(err);
  }
});

export default router;
