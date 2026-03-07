import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

async function resolveWeddingId(userId: string): Promise<string> {
  const wedding = await prisma.wedding.findUnique({ where: { userId } });
  if (!wedding) throw new AppError('Wedding not found', 404);
  return wedding.id;
}

export async function getGuests(userId: string) {
  const weddingId = await resolveWeddingId(userId);
  return prisma.guest.findMany({ where: { weddingId }, orderBy: { createdAt: 'asc' } });
}

export async function createGuest(
  userId: string,
  data: {
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    rsvpStatus?: string;
    dietaryNeeds?: string | null;
    plusOne?: boolean;
    tableId?: string | null;
  },
) {
  const weddingId = await resolveWeddingId(userId);
  return prisma.guest.create({ data: { weddingId, ...data } });
}

export async function updateGuest(userId: string, guestId: string, data: Partial<{
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  rsvpStatus: string;
  dietaryNeeds: string | null;
  plusOne: boolean;
  tableId: string | null;
}>) {
  const weddingId = await resolveWeddingId(userId);
  const guest = await prisma.guest.findFirst({ where: { id: guestId, weddingId } });
  if (!guest) throw new AppError('Guest not found', 404);
  return prisma.guest.update({ where: { id: guestId }, data });
}

export async function deleteGuest(userId: string, guestId: string) {
  const weddingId = await resolveWeddingId(userId);
  const guest = await prisma.guest.findFirst({ where: { id: guestId, weddingId } });
  if (!guest) throw new AppError('Guest not found', 404);
  return prisma.guest.delete({ where: { id: guestId } });
}

export async function bulkCreateGuests(
  userId: string,
  guests: Array<{
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    rsvpStatus?: string;
    dietaryNeeds?: string | null;
    plusOne?: boolean;
    tableId?: string | null;
  }>,
) {
  const weddingId = await resolveWeddingId(userId);
  return prisma.guest.createMany({
    data: guests.map((g) => ({ weddingId, ...g })),
    skipDuplicates: true,
  });
}
