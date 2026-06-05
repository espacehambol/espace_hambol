const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.reservation.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.roomType.deleteMany({});
  await prisma.site.deleteMany({});

  // 1. Create Sites
  const azaguie = await prisma.site.create({
    data: {
      name: 'Azaguié',
      location: 'Azaguié Ahoua',
      description: 'Détente, sport et célébrations en plein air.',
    },
  });

  const yopougon = await prisma.site.create({
    data: {
      name: 'Yopougon',
      location: 'Yopougon Ananeraie',
      description: 'Confort urbain et détente en altitude.',
    },
  });

  // 2. Create Room Types
  const standard = await prisma.roomType.create({
    data: {
      name: 'Standard Climatisée',
      description: 'Chambre tout confort avec climatisation.',
      price: 20000,
      capacity: 2,
    },
  });

  const suite = await prisma.roomType.create({
    data: {
      name: 'Suite Business',
      description: 'Espace de luxe pour séjours prolongés ou affaires.',
      price: 35000,
      capacity: 2,
    },
  });

  // 3. Create 11 Rooms for Azaguié
  const azaguieRooms = [];
  for (let i = 1; i <= 11; i++) {
    azaguieRooms.push({
      number: `A${i.toString().padStart(2, '0')}`,
      status: 'AVAILABLE',
      siteId: azaguie.id,
      roomTypeId: standard.id,
    });
  }
  await prisma.room.createMany({ data: azaguieRooms });

  // 4. Create 11 Rooms for Yopougon
  const yopougonRooms = [];
  for (let i = 1; i <= 11; i++) {
    yopougonRooms.push({
      number: `Y${i.toString().padStart(2, '0')}`,
      status: 'AVAILABLE',
      siteId: yopougon.id,
      roomTypeId: standard.id,
    });
  }
  await prisma.room.createMany({ data: yopougonRooms });

  // 5. Create specific Services for Yopougon
  await prisma.service.createMany({
    data: [
      { name: 'Bar Climatisé', description: 'Bar lounge avec air conditionné', price: 0, siteId: yopougon.id },
      { name: 'Restaurant Gastronomique', description: 'Cuisine ivoirienne et internationale', price: 0, siteId: yopougon.id },
      { name: 'Salle Irène Touré', description: 'Salle événementielle climatisée', price: 150000, siteId: yopougon.id },
      { name: 'Terrasse 4ème Étage', description: 'Maquis à ciel ouvert en altitude', price: 0, siteId: yopougon.id },
      { name: 'Lavage Auto RDC', description: 'Nettoyage professionnel de véhicules', price: 3000, siteId: yopougon.id },
    ],
  });

  // 6. Create specific Services for Azaguié
  await prisma.service.createMany({
    data: [
      { name: 'Piscine', description: 'Accès à la piscine du domaine', price: 2000, siteId: azaguie.id },
      { name: 'Restaurant Plein Air', description: 'Gastronomie forestière', price: 0, siteId: azaguie.id },
      { name: 'Hangar Événements', description: 'Espace pour mariages et anniversaires', price: 100000, siteId: azaguie.id },
      { name: 'Terrain Maracana', description: 'Terrain de sport synthétique', price: 5000, siteId: azaguie.id },
      { name: 'Location Matériel', description: 'Location de 5 bâches et 500 chaises', price: 500, siteId: azaguie.id },
    ],
  });

  console.log('Detailed Seeding completed successfully (11 rooms per site + specific services).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
