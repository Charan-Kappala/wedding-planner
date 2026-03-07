import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const password = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@weddingplanner.com' },
    update: {},
    create: {
      email: 'demo@weddingplanner.com',
      password,
      wedding: {
        create: {
          date: new Date('2025-06-15'),
          venueName: 'The Grand Ballroom',
          venueAddress: '123 Wedding Lane, Romance City, CA 90210',
          budget: 30000,
          partner1Name: 'Alex',
          partner2Name: 'Jordan',
        },
      },
    },
    include: { wedding: true },
  });

  const wedding = user.wedding!;

  // Seed some tasks
  const taskTemplates = [
    { title: 'Book the venue', category: 'Venue', dueDate: new Date('2024-06-15') },
    { title: 'Send invitations', category: 'Invitations', dueDate: new Date('2024-12-01') },
    { title: 'Choose wedding dress/attire', category: 'Attire', dueDate: new Date('2024-09-01') },
    { title: 'Book photographer', category: 'Photography', dueDate: new Date('2024-07-01') },
    { title: 'Plan catering menu', category: 'Catering', dueDate: new Date('2024-11-01') },
    { title: 'Book florist', category: 'Flowers', dueDate: new Date('2024-10-01') },
  ];

  for (const task of taskTemplates) {
    await prisma.task.upsert({
      where: { id: `seed-${task.title.replace(/\s+/g, '-').toLowerCase()}` },
      update: {},
      create: { id: `seed-${task.title.replace(/\s+/g, '-').toLowerCase()}`, weddingId: wedding.id, ...task },
    });
  }

  console.log(`✅ Seeded demo user: demo@weddingplanner.com / password123`);
  console.log(`✅ Wedding ID: ${wedding.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
