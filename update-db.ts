import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const updateReservations = await prisma.reservation.updateMany({
    where: { status: 'PENDING' },
    data: { status: 'CONFIRMED' },
  });
  console.log(`Updated ${updateReservations.count} reservations to CONFIRMED.`);

  const updateRequests = await prisma.conciergeRequest.updateMany({
    where: { status: 'PENDING' },
    data: { status: 'COMPLETED' },
  });
  console.log(`Updated ${updateRequests.count} concierge requests to COMPLETED.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
