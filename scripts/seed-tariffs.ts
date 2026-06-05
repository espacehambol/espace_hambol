import prisma from '../src/lib/prisma';

async function seed() {
  try {
    console.log('Starting seed...');

    // Sites
    await (prisma as any).site.upsert({
      where: { id: 'azaguie' },
      update: { name: 'Azaguié' },
      create: { id: 'azaguie', name: 'Azaguié', location: 'Ahoua', description: 'LÉvasion Naturelle' }
    });
    await (prisma as any).site.upsert({
      where: { id: 'yopougon' },
      update: { name: 'Yopougon' },
      create: { id: 'yopougon', name: 'Yopougon', location: 'Ananeraie', description: 'LÉlégance Urbaine' }
    });

    // New Tariffs
    const tariffs = [
      { id: 'rt-passage', name: 'Passage 1h30', description: 'Passage rapide 1h30', price: 10000, capacity: 2 },
      { id: 'rt-longrepos', name: 'Long Repos (10h)', description: 'Repos prolongé 10h', price: 15000, capacity: 2 },
      { id: 'rt-nuitee', name: 'Nuitée (22h-12h)', description: '22H au lendemain midi', price: 15000, capacity: 2 },
      { id: 'rt-sejour-20', name: 'Séjour 24h (Standard)', description: '24H + Petit Déjeuner + Eau', price: 20000, capacity: 2 },
      { id: 'rt-sejour-25', name: 'Séjour 24h (Complet)', description: '24H + P.Dej (2) + Dej (1)', price: 25000, capacity: 2 },
    ];

    for (const t of tariffs) {
      await (prisma as any).roomType.upsert({
        where: { id: t.id },
        update: { ...t },
        create: { ...t }
      });
    }

    // 11 Rooms per site
    for (let i = 1; i <= 11; i++) {
      const azNum = (100 + i).toString();
      await (prisma as any).room.upsert({
        where: { id: `az-r${azNum}` },
        update: { status: 'AVAILABLE' },
        create: { id: `az-r${azNum}`, number: azNum, status: 'AVAILABLE', siteId: 'azaguie', roomTypeId: 'rt-nuitee' }
      });
      const yopNum = (200 + i).toString();
      await (prisma as any).room.upsert({
        where: { id: `yop-r${yopNum}` },
        update: { status: 'AVAILABLE' },
        create: { id: `yop-r${yopNum}`, number: yopNum, status: 'AVAILABLE', siteId: 'yopougon', roomTypeId: 'rt-nuitee' }
      });
    }

    console.log('Seed completed successfully!');
    const roomCount = await prisma.room.count();
    console.log('Final Room count:', roomCount);

  } catch (e) {
    console.error('Seed failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
