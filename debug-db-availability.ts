import prisma from './src/lib/prisma';

async function check() {
  try {
    const siteCount = await prisma.site.count();
    const roomCount = await prisma.room.count();
    const resCount = await prisma.reservation.count();
    const rtCount = await prisma.roomType.count();
    
    console.log('Site count:', siteCount);
    console.log('Room count:', roomCount);
    console.log('Reservation count:', resCount);
    console.log('RoomType count:', rtCount);

    if (siteCount > 0) {
        const sites = await prisma.site.findMany();
        console.log('Sites:', sites.map(s => s.name));
    }
  } catch (e) {
    console.error('Database check failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
