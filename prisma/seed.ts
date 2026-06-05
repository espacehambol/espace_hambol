const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Create Sites
  const azaguie = await prisma.site.upsert({
    where: { id: 'azaguie' },
    update: {},
    create: {
      id: 'azaguie',
      name: 'Azaguié',
      location: 'Ahoua',
      description: 'L\'Évaison Naturelle',
    },
  });

  const yopougon = await prisma.site.upsert({
    where: { id: 'yopougon' },
    update: {},
    create: {
      id: 'yopougon',
      name: 'Yopougon',
      location: 'Ananeraie',
      description: 'L\'Élégance Urbaine',
    },
  });

  // 2. Create a Mock Customer
  const customer = await prisma.user.upsert({
    where: { email: 'jean-luc@hambol.com' },
    update: {},
    create: {
      email: 'jean-luc@hambol.com',
      name: 'Jean-Luc Gbagbo',
      password: 'password123',
      role: 'CLIENT',
      loyalty: {
        create: {
          points: 2450,
          tier: 'GOLD',
        }
      },
      transactions: {
        create: [
          { amount: 30000, type: 'PAYMENT', status: 'PAID', description: 'Acompte Séjour RH-4920' },
          { amount: 15400, type: 'PAYMENT', status: 'PAID', description: 'Dîner Gastronomique' },
        ]
      }
    },
  });

  // 3. Create Inventory Items
  await prisma.inventoryItem.createMany({
    data: [
      { name: 'Draps de lit', category: 'Housekeeping', quantity: 24, unit: 'paires', siteId: azaguie.id },
      { name: 'Savon Hôte', category: 'Service', quantity: 150, unit: 'unités', siteId: azaguie.id },
      { name: 'Vin de Palme', category: 'Beverage', quantity: 12, unit: 'bouteilles', siteId: azaguie.id },
      { name: 'Champagne Brut', category: 'Beverage', quantity: 8, unit: 'bouteilles', siteId: yopougon.id },
      { name: 'Serviettes VIP', category: 'Linen', quantity: 40, unit: 'unités', siteId: yopougon.id },
    ],
    skipDuplicates: true,
  });

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export {}; // Ensure it is treated as a module
