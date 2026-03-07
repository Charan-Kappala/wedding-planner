import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export async function getWedding(userId: string) {
  const wedding = await prisma.wedding.findUnique({ where: { userId } });
  if (!wedding) throw new AppError('Wedding not found', 404);
  return wedding;
}

export async function updateWedding(
  userId: string,
  data: {
    date?: string | null;
    venueName?: string | null;
    venueAddress?: string | null;
    budget?: number;
    partner1Name?: string | null;
    partner2Name?: string | null;
  },
) {
  const wedding = await prisma.wedding.findUnique({ where: { userId } });
  if (!wedding) throw new AppError('Wedding not found', 404);

  return prisma.wedding.update({
    where: { userId },
    data: {
      date: data.date !== undefined ? (data.date ? new Date(data.date) : null) : undefined,
      venueName: data.venueName,
      venueAddress: data.venueAddress,
      budget: data.budget,
      partner1Name: data.partner1Name,
      partner2Name: data.partner2Name,
    },
  });
}
