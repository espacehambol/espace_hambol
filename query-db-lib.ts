import prisma from './src/lib/prisma';

async function main() {
  const reservations = await prisma.reservation.findMany();
  console.log('Reservations length:', reservations.length);
  if (reservations.length > 0) {
    console.log('Reservations:', reservations.map((r: any) => ({ id: r.id, status: r.status })));
  }

  const requests = await prisma.conciergeRequest.findMany();
  console.log('Requests length:', requests.length);
  if (requests.length > 0) {
    console.log('Requests:', requests.map((r: any) => ({ id: r.id, status: r.status })));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
