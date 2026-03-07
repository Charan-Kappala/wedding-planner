import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import {
  getGuests,
  createGuest,
  updateGuest,
  deleteGuest,
  bulkCreateGuests,
} from '../services/guestService';

const router = Router();
router.use(authenticate);

const guestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  rsvpStatus: z.enum(['PENDING', 'ACCEPTED', 'DECLINED']).optional(),
  dietaryNeeds: z.string().nullable().optional(),
  plusOne: z.boolean().optional(),
  tableId: z.string().nullable().optional(),
});

const updateSchema = guestSchema.partial();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const guests = await getGuests(req.user!.userId);
    res.json({ success: true, data: guests });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = guestSchema.parse(req.body);
    const guest = await createGuest(req.user!.userId, data);
    res.status(201).json({ success: true, data: guest });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateSchema.parse(req.body);
    const parsedData = { ...data };
    if (parsedData.tableId === '') parsedData.tableId = null as any;
    if (parsedData.email === '') parsedData.email = null as any;
    
    const guest = await updateGuest(req.user!.userId, req.params.id, parsedData as any);
    res.json({ success: true, data: guest });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteGuest(req.user!.userId, req.params.id);
    res.json({ success: true, data: { message: 'Guest deleted' } });
  } catch (err) {
    next(err);
  }
});

// Bulk CSV import — expects JSON array of guests after CSV parsing on client
router.post('/import', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const importSchema = z.array(guestSchema);
    const guests = importSchema.parse(req.body);
    const result = await bulkCreateGuests(req.user!.userId, guests);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// Send RSVP reminder (stub — logs to console for now)
router.post('/:id/remind', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const guests = await getGuests(req.user!.userId);
    const guest = guests.find((g) => g.id === req.params.id);
    if (!guest) {
      res.status(404).json({ success: false, error: 'Guest not found' });
      return;
    }
    console.log(`[Email stub] RSVP reminder sent to ${guest.email ?? '(no email)'} for ${guest.firstName} ${guest.lastName}`);
    res.json({ success: true, data: { message: 'Reminder sent' } });
  } catch (err) {
    next(err);
  }
});

export default router;
