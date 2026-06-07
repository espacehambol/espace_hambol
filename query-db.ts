import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const reservations = await prisma.reservation.findMany();
  console.log('Reservations:', reservations.map((r: any) => ({ id: r.id, status: r.status })));

  const requests = await prisma.conciergeRequest.findMany();
  console.log('Requests:', requests.map((r: any) => ({ id: r.id, status: r.status })));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
