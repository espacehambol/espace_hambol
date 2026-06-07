import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

/**
 * ONE-TIME SETUP ENDPOINT
 * Visit /api/setup once to initialize the database on the production server.
 * After running, the database will be fully seeded and ready to use.
 */
export async function GET(request: NextRequest) {
  try {
    const reset = request.nextUrl.searchParams.get('reset') === 'true';
    if (reset) {
      // Drop all tables in reverse order of foreign key constraints
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "DishComponent"`);
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Dish"`);
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "InventoryItem"`);
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Service"`);
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Staff"`);
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Review"`);
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "ConciergeRequest"`);
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "GuestPreferences"`);
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "KycData"`);
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Reservation"`);
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Room"`);
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Transaction"`);
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "LoyaltyProgram"`);
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "User"`);
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "RoomType"`);
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Site"`);
      console.log('[Setup] Database reset: all tables dropped.');
    }

    // 1. Automatically create database directory if it does not exist
    const dbUrl = process.env.DATABASE_URL || '';
    if (dbUrl.startsWith('file:')) {
      const dbPath = dbUrl.replace('file:', '');
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created database directory: ${dir}`);
      }
    }

    // Create all tables using raw SQL (works even if Prisma migration hasn't been run)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Site" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "location" TEXT,
        "description" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "RoomType" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "price" REAL NOT NULL DEFAULT 25000,
        "capacity" INTEGER NOT NULL DEFAULT 2,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'CLIENT',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "LoyaltyProgram" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "points" INTEGER NOT NULL DEFAULT 0,
        "tier" TEXT NOT NULL DEFAULT 'STANDARD',
        "userId" TEXT NOT NULL UNIQUE,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Transaction" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "amount" REAL NOT NULL,
        "type" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "description" TEXT,
        "userId" TEXT NOT NULL,
        "reservationId" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
        FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Room" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "number" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
        "roomTypeId" TEXT NOT NULL,
        "siteId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("siteId") REFERENCES "Site"("id"),
        FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id")
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Reservation" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "checkIn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "checkOut" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "checkInStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
        "totalPrice" REAL NOT NULL DEFAULT 0,
        "paymentIntentId" TEXT,
        "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
        "roomId" TEXT NOT NULL,
        "clientId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("clientId") REFERENCES "User"("id"),
        FOREIGN KEY ("roomId") REFERENCES "Room"("id")
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "KycData" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "idType" TEXT NOT NULL,
        "idNumber" TEXT NOT NULL,
        "idExpiry" DATETIME,
        "idImage" TEXT,
        "reservationId" TEXT NOT NULL UNIQUE,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "GuestPreferences" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "pillowType" TEXT,
        "beverages" TEXT,
        "cleaningTime" TEXT,
        "dietaryNotes" TEXT,
        "userId" TEXT NOT NULL UNIQUE,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ConciergeRequest" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "type" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "description" TEXT,
        "roomNumber" TEXT NOT NULL DEFAULT '101',
        "site" TEXT NOT NULL DEFAULT 'Azaguié',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Review" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "rating" INTEGER NOT NULL DEFAULT 5,
        "comment" TEXT,
        "category" TEXT,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "site" TEXT NOT NULL DEFAULT 'Yopougon',
        "userId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Staff" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL UNIQUE,
        "siteId" TEXT NOT NULL,
        "position" TEXT NOT NULL DEFAULT 'STAFF',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id"),
        FOREIGN KEY ("siteId") REFERENCES "Site"("id")
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Service" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "price" REAL,
        "siteId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("siteId") REFERENCES "Site"("id")
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "InventoryItem" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "category" TEXT NOT NULL DEFAULT 'Divers',
        "quantity" REAL NOT NULL DEFAULT 0,
        "unit" TEXT NOT NULL DEFAULT 'unité',
        "minThreshold" REAL NOT NULL DEFAULT 5,
        "siteId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("siteId") REFERENCES "Site"("id")
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Dish" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "description" TEXT,
        "price" REAL,
        "image" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT 1,
        "siteId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("siteId") REFERENCES "Site"("id")
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "DishComponent" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "optional" BOOLEAN NOT NULL DEFAULT 0,
        "dishId" TEXT NOT NULL,
        FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE CASCADE
      )
    `);

    // Migrate existing Review table if it exists
    try {
      await prisma.$executeRawUnsafe(\`ALTER TABLE "Review" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PENDING'\`);
      await prisma.$executeRawUnsafe(\`ALTER TABLE "Review" ADD COLUMN "site" TEXT NOT NULL DEFAULT 'Yopougon'\`);
      console.log('[Setup] Added status and site columns to Review table');
    } catch (e) {
      // Ignorer si les colonnes existent déjà
    }

    // ─── SEED DATA ───────────────────────────────────────────────────────────

    // Sites
    await prisma.$executeRawUnsafe(`
      INSERT OR IGNORE INTO "Site" (id, name, location, description)
      VALUES 
        ('azaguie', 'Azaguié', 'Ahoua', 'L Évasion Naturelle'),
        ('yopougon', 'Yopougon', 'Ananeraie', 'L Élégance Urbaine')
    `);

    // New Tariffs (Room Types) based on Image
    const tariffs = [
      { id: 'rt-passage', name: 'Passage 1h30', desc: 'Passage rapide 1h30', price: 10000, cap: 2 },
      { id: 'rt-longrepos', name: 'Long Repos (10h)', desc: 'Repos prolongé 10h', price: 15000, cap: 2 },
      { id: 'rt-nuitee', name: 'Nuitée (22h-12h)', desc: '22H au lendemain midi', price: 15000, cap: 2 },
      { id: 'rt-sejour-20', name: 'Séjour 24h (Standard)', desc: '24H + Petit Déjeuner + Eau', price: 20000, cap: 2 },
      { id: 'rt-sejour-25', name: 'Séjour 24h (Complet)', desc: '24H + P.Dej (2) + Dej (1)', price: 25000, cap: 2 },
    ];

    for (const t of tariffs) {
      await prisma.$executeRawUnsafe(`
        INSERT OR IGNORE INTO "RoomType" (id, name, description, price, capacity)
        VALUES ('${t.id}', '${t.name}', '${t.desc}', ${t.price}, ${t.cap})
      `);
    }

    // Rooms initialization: 11 rooms per site (Azaguie: 101-111, Yopougon: 201-211)
    for (let i = 1; i <= 11; i++) {
      // Azaguie rooms
      const azNum = 100 + i;
      await prisma.$executeRawUnsafe(`
        INSERT OR IGNORE INTO "Room" (id, number, status, siteId, roomTypeId)
        VALUES ('az-r${azNum}', '${azNum}', 'AVAILABLE', 'azaguie', 'rt-nuitee')
      `);
      // Yopougon rooms
      const yopNum = 200 + i;
      await prisma.$executeRawUnsafe(`
        INSERT OR IGNORE INTO "Room" (id, number, status, siteId, roomTypeId)
        VALUES ('yop-r${yopNum}', '${yopNum}', 'AVAILABLE', 'yopougon', 'rt-nuitee')
      `);
    }

    // Dishes (Initial Menu)
    await prisma.$executeRawUnsafe(`
      INSERT OR IGNORE INTO "Dish" (id, name, category, image, siteId, description, price)
      VALUES 
        -- Yopougon - Menu du Soir (de l''image menu_yop.png)
        ('yop-d1', 'Carpe Grillée / Sautée', 'Terroir', '/images/yopougon/food/cuisine_1.png', 'yopougon', 'Tailles disponibles : 4000 F / 5000 F / 6000 F / 8000 F (+500 F pour les sautés)', 4000),
        ('yop-d2', 'Saint Pierre Grillé / Sauté', 'Terroir', '/images/yopougon/food/cuisine_2.png', 'yopougon', 'Tailles disponibles : 5000 F / 6000 F / 8000 F (+500 F pour les sautés)', 5000),
        ('yop-d3', 'Poisson Sol Grillé / Sauté', 'Terroir', '/images/yopougon/food/cuisine_3.png', 'yopougon', 'Tailles disponibles : 5000 F / 6000 F / 7000 F (+500 F pour les sautés)', 5000),
        ('yop-d4', 'Poisson Cha Cha Grillé / Sauté', 'Terroir', '/images/yopougon/food/cuisine_2.png', 'yopougon', 'Tailles disponibles : 3000 F / 4000 F (+500 F pour les sautés)', 3000),
        ('yop-d5', 'Poulet Grillé / Sauté', 'Signature', '/images/yopougon/food/cuisine_1.png', 'yopougon', 'Poulet de chair braisé. Demi : 3500 F / Entier : 6000 F (+500 F pour les sautés)', 3500),
        ('yop-d6', 'Pintade Grillée / Sautée', 'Signature', '/images/yopougon/food/cuisine_3.png', 'yopougon', 'Pintade braisée. Demi : 6500 F / Entière : 12000 F (+500 F pour les sautés)', 6500),
        ('yop-d7', 'Lapin Grillé / Sauté', 'Signature', '/images/yopougon/food/cuisine_2.png', 'yopougon', 'Lapin braisé. Demi : 6500 F / Entier : 12000 F (+500 F pour les sautés)', 6500),
        ('yop-d8', 'Attiéké Poisson Carpe Grillé', 'Terroir', '/images/yopougon/food/cuisine_1.png', 'yopougon', 'Poisson carpe grillé servi avec attiéké. Tailles : 4000 F / 5000 F / 6000 F / 8000 F', 4000),
        ('yop-d9', 'Attiéké Poisson Sosso Grillé', 'Terroir', '/images/yopougon/food/cuisine_2.png', 'yopougon', 'Poisson Sosso grillé servi avec attiéké. Tailles : 5000 F / 6000 F / 8000 F', 5000),
        ('yop-d10', 'Attiéké Poisson Sol Grillé', 'Terroir', '/images/yopougon/food/cuisine_3.png', 'yopougon', 'Poisson Sol grillé servi avec attiéké. Tailles : 5000 F / 7000 F / 8000 F / 10000 F', 5000),
        ('yop-d11', 'Attiéké Poisson Capitaine Grillé', 'Terroir', '/images/yopougon/food/cuisine_1.png', 'yopougon', 'Poisson Capitaine grillé servi avec attiéké. Tailles : 3000 F / 5000 F', 3000),
        ('yop-d12', 'Brochettes de Gésier', 'Signature', '/images/yopougon/food/cuisine_3.png', 'yopougon', 'Brochette de gésier de poulet grillée (1500 F la brochette)', 1500),
        ('yop-d13', 'Brochette de Filet de Bœuf', 'Signature', '/images/yopougon/food/cuisine_1.png', 'yopougon', 'Brochette de filet de bœuf tendre grillée (1500 F la brochette)', 1500),
        ('yop-d14', 'Brochette de Blanc de Poulet', 'Signature', '/images/yopougon/food/cuisine_2.png', 'yopougon', 'Brochette de blanc de poulet grillée (1500 F la brochette)', 1500),
        ('yop-d15', 'Plat de Saucisses Braisées', 'Terroir', '/images/yopougon/food/cuisine_2.png', 'yopougon', 'Plat contenant 2 saucisses grillées au feu de bois (2000 F/plat)', 2000),
        ('yop-d16', 'Croupillon de Dinde Braisé', 'Terroir', '/images/yopougon/food/cuisine_3.png', 'yopougon', 'Croupillon de dinde braisé (2000 F / 3000 F)', 2000),
        ('yop-d17', 'Brochette Simple', 'Signature', '/images/yopougon/food/cuisine_1.png', 'yopougon', 'Brochette simple au choix : poulet, gésiers, viande (1500 F la brochette)', 1500),
        ('yop-d18', 'Soupe de Carpe', 'Tradition', '/images/yopougon/food/cuisine_2.png', 'yopougon', 'Soupe parfumée de poisson carpe. Tailles : 4000 F / 5000 F / 6000 F / 8000 F', 4000),
        ('yop-d19', 'Soupe de Saint Pierre', 'Tradition', '/images/yopougon/food/cuisine_1.png', 'yopougon', 'Soupe de poisson Saint Pierre. Tailles : 5000 F / 6000 F / 8000 F', 5000),
        ('yop-d20', 'Soupe de Poulet Pondeuse', 'Tradition', '/images/yopougon/food/cuisine_3.png', 'yopougon', 'Soupe de poulet pondeuse. Tarifs : 4000 F / 6000 F', 4000),
        ('yop-d21', 'Soupe de Pintade', 'Tradition', '/images/yopougon/food/cuisine_2.png', 'yopougon', 'Soupe de pintade. Demi : 6500 F / Entière : 12000 F', 6500),
        ('yop-d22', 'Soupe de Lapin', 'Tradition', '/images/yopougon/food/cuisine_1.png', 'yopougon', 'Soupe de lapin. Demi : 6500 F / Entier : 12000 F', 6500),
        ('yop-d23', 'Portion de Frites', 'Terroir', '/images/yopougon/food/cuisine_2.png', 'yopougon', 'Portion de frites de pomme de terre maison', 1500),
        ('yop-d24', 'Portion d''Alloco', 'Terroir', '/images/yopougon/food/cuisine_1.png', 'yopougon', 'Portion d''alloco (bananes plantains frites)', 1000),
        ('yop-d25', 'Portion d''Attiéké', 'Terroir', '/images/yopougon/food/cuisine_3.png', 'yopougon', 'Portion d''attiéké (semoule de manioc)', 500),
        ('yop-d26', 'Portion d''Igname Frite / Bouillie', 'Terroir', '/images/yopougon/food/cuisine_2.png', 'yopougon', 'Portion d''igname frite ou bouillie', 1000),
        ('yop-d27', 'Portion de Riz', 'Terroir', '/images/yopougon/food/cuisine_1.png', 'yopougon', 'Portion de riz blanc nature', 1000),
        ('yop-b1', 'Heineken', 'Bières', '/images/yopougon/drinks/heineken.png', 'yopougon', 'Bière blonde Heineken', 700),
        ('yop-b2', 'Despérados', 'Bières', '/images/yopougon/drinks/desperados.png', 'yopougon', 'Bière aromatisée Tequila', 700),
        ('yop-b3', 'Beaufort', 'Bières', '/images/yopougon/drinks/beaufort.png', 'yopougon', 'Bière blonde Beaufort', 700),
        ('yop-b4', 'Doppel Munich', 'Bières', '/images/yopougon/drinks/doppel.png', 'yopougon', 'Bière brune forte Doppel Munich', 700),
        ('yop-b5', 'Doppel Energy', 'Bières', '/images/yopougon/drinks/doppel_energy.png', 'yopougon', 'Bière Doppel Energy booster', 700),
        ('yop-b6', 'Tequila Beer', 'Bières', '/images/yopougon/drinks/tequila.png', 'yopougon', 'Bière aromatisée Tequila', 700),
        ('yop-b7', 'Racines', 'Bières', '/images/yopougon/drinks/racines.png', 'yopougon', 'Boisson alcoolisée aux extraits de plantes Racines', 700),
        ('yop-b8', 'Bavaria', 'Bières', '/images/yopougon/drinks/bavaria.png', 'yopougon', 'Bière Bavaria', 700),
        ('yop-b9', 'Bock 66', 'Bières', '/images/yopougon/drinks/bock.png', 'yopougon', 'Bière Bock 66', 700),
        ('yop-b10', 'Cody''s', 'Bières', '/images/yopougon/drinks/codys.png', 'yopougon', 'Bière Cody''s', 700),
        ('yop-b11', 'Castel Beer', 'Bières', '/images/yopougon/drinks/castel.png', 'yopougon', 'Bière Castel Lager', 700),
        ('yop-b12', 'Guinness', 'Bières', '/images/yopougon/drinks/guinness.png', 'yopougon', 'Bière brune Guinness stout', 1000),
        ('yop-b13', 'Budweiser', 'Bières', '/images/yopougon/drinks/budweiser.png', 'yopougon', 'Bière blonde Budweiser', 1000),
        ('yop-b14', 'Chill', 'Sucreries', '/images/yopougon/drinks/chill.png', 'yopougon', 'Bière Chill aromatisée', 800),
        ('yop-b15', 'Orangina', 'Sucreries', '/images/yopougon/drinks/orangina.png', 'yopougon', 'Boisson gazeuse Orangina aux fruits', 800),
        ('yop-b16', 'Malta Guinness', 'Sucreries', '/images/yopougon/drinks/malta.png', 'yopougon', 'Boisson maltée sans alcool Malta', 800),
        ('yop-b17', 'Smirnoff Ice', 'Sucreries', '/images/yopougon/drinks/smirnoff.png', 'yopougon', 'Boisson prémixée Smirnoff Ice (Sminorffice)', 800),
        ('yop-b18', 'Coca-Cola', 'Softs', '/images/yopougon/drinks/coca.png', 'yopougon', 'Boisson gazeuse Coca-Cola', 600),
        ('yop-b19', 'Sprite', 'Softs', '/images/yopougon/drinks/sprite.png', 'yopougon', 'Boisson gazeuse Sprite citron-limon', 600),
        ('yop-b20', 'Fanta', 'Softs', '/images/yopougon/drinks/fanta.png', 'yopougon', 'Boisson gazeuse Fanta orange', 600),
        ('yop-b21', 'Tonic', 'Softs', '/images/yopougon/drinks/tonic.png', 'yopougon', 'Boisson gazeuse Tonic Schweppes', 600),
        ('yop-b22', 'Moka Café', 'Softs', '/images/yopougon/drinks/moka.png', 'yopougon', 'Boisson Moka Café', 700),
        ('yop-b23', 'Bouteille de Vin', 'Vins', '/images/yopougon/drinks/vin.png', 'yopougon', 'Vin de table sélectionné (Rouge/Rosé/Blanc). À partir de 2500 F', 2500),
        ('az-d1', 'Carpe Grillée / Sautée', 'Terroir', '/images/yopougon/food/cuisine_1.png', 'azaguie', 'Tailles disponibles : 4000 F / 5000 F / 6000 F / 8000 F (+500 F pour les sautés)', 4000),
        ('az-d2', 'Saint Pierre Grillé / Sauté', 'Terroir', '/images/yopougon/food/cuisine_2.png', 'azaguie', 'Tailles disponibles : 5000 F / 6000 F / 8000 F (+500 F pour les sautés)', 5000),
        ('az-d3', 'Poisson Sol Grillé / Sauté', 'Terroir', '/images/yopougon/food/cuisine_3.png', 'azaguie', 'Tailles disponibles : 5000 F / 6000 F / 7000 F (+500 F pour les sautés)', 5000),
        ('az-d4', 'Poisson Cha Cha Grillé / Sauté', 'Terroir', '/images/yopougon/food/cuisine_2.png', 'azaguie', 'Tailles disponibles : 3000 F / 4000 F (+500 F pour les sautés)', 3000),
        ('az-d5', 'Poulet Grillé / Sauté', 'Signature', '/images/yopougon/food/cuisine_1.png', 'azaguie', 'Poulet de chair braisé. Demi : 3500 F / Entier : 6000 F (+500 F pour les sautés)', 3500),
        ('az-d6', 'Pintade Grillée / Sautée', 'Signature', '/images/yopougon/food/cuisine_3.png', 'azaguie', 'Pintade braisée. Demi : 6500 F / Entière : 12000 F (+500 F pour les sautés)', 6500),
        ('az-d7', 'Lapin Grillé / Sauté', 'Signature', '/images/yopougon/food/cuisine_2.png', 'azaguie', 'Lapin braisé. Demi : 6500 F / Entier : 12000 F (+500 F pour les sautés)', 6500),
        ('az-d8', 'Attiéké Poisson Carpe Grillé', 'Terroir', '/images/yopougon/food/cuisine_1.png', 'azaguie', 'Poisson carpe grillé servi avec attiéké. Tailles : 4000 F / 5000 F / 6000 F / 8000 F', 4000),
        ('az-d9', 'Attiéké Poisson Sosso Grillé', 'Terroir', '/images/yopougon/food/cuisine_2.png', 'azaguie', 'Poisson Sosso grillé servi avec attiéké. Tailles : 5000 F / 6000 F / 8000 F', 5000),
        ('az-d10', 'Attiéké Poisson Sol Grillé', 'Terroir', '/images/yopougon/food/cuisine_3.png', 'azaguie', 'Poisson Sol grillé servi avec attiéké. Tailles : 5000 F / 7000 F / 8000 F / 10000 F', 5000),
        ('az-d11', 'Attiéké Poisson Capitaine Grillé', 'Terroir', '/images/yopougon/food/cuisine_1.png', 'azaguie', 'Poisson Capitaine grillé servi avec attiéké. Tailles : 3000 F / 5000 F', 3000),
        ('az-d12', 'Brochettes de Gésier', 'Signature', '/images/yopougon/food/cuisine_3.png', 'azaguie', 'Brochette de gésier de poulet grillée (1500 F la brochette)', 1500),
        ('az-d13', 'Brochette de Filet de Bœuf', 'Signature', '/images/yopougon/food/cuisine_1.png', 'azaguie', 'Brochette de filet de bœuf tendre grillée (1500 F la brochette)', 1500),
        ('az-d14', 'Brochette de Blanc de Poulet', 'Signature', '/images/yopougon/food/cuisine_2.png', 'azaguie', 'Brochette de blanc de poulet grillée (1500 F la brochette)', 1500),
        ('az-d15', 'Plat de Saucisses Braisées', 'Terroir', '/images/yopougon/food/cuisine_2.png', 'azaguie', 'Plat contenant 2 saucisses grillées au feu de bois (2000 F/plat)', 2000),
        ('az-d16', 'Croupillon de Dinde Braisé', 'Terroir', '/images/yopougon/food/cuisine_3.png', 'azaguie', 'Croupillon de dinde braisé (2000 F / 3000 F)', 2000),
        ('az-d17', 'Brochette Simple', 'Signature', '/images/yopougon/food/cuisine_1.png', 'azaguie', 'Brochette simple au choix : poulet, gésiers, viande (1500 F la brochette)', 1500),
        ('az-d18', 'Soupe de Carpe', 'Tradition', '/images/yopougon/food/cuisine_2.png', 'azaguie', 'Soupe parfumée de poisson carpe. Tailles : 4000 F / 5000 F / 6000 F / 8000 F', 4000),
        ('az-d19', 'Soupe de Saint Pierre', 'Tradition', '/images/yopougon/food/cuisine_1.png', 'azaguie', 'Soupe de poisson Saint Pierre. Tailles : 5000 F / 6000 F / 8000 F', 5000),
        ('az-d20', 'Soupe de Poulet Pondeuse', 'Tradition', '/images/yopougon/food/cuisine_3.png', 'azaguie', 'Soupe de poulet pondeuse. Tarifs : 4000 F / 6000 F', 4000),
        ('az-d21', 'Soupe de Pintade', 'Tradition', '/images/yopougon/food/cuisine_2.png', 'azaguie', 'Soupe de pintade. Demi : 6500 F / Entière : 12000 F', 6500),
        ('az-d22', 'Soupe de Lapin', 'Tradition', '/images/yopougon/food/cuisine_1.png', 'azaguie', 'Soupe de lapin. Demi : 6500 F / Entier : 12000 F', 6500),
        ('az-d23', 'Portion de Frites', 'Terroir', '/images/yopougon/food/cuisine_2.png', 'azaguie', 'Portion de frites de pomme de terre maison', 1500),
        ('az-d24', 'Portion d''Alloco', 'Terroir', '/images/yopougon/food/cuisine_1.png', 'azaguie', 'Portion d''alloco (bananes plantains frites)', 1000),
        ('az-d25', 'Portion d''Attiéké', 'Terroir', '/images/yopougon/food/cuisine_3.png', 'azaguie', 'Portion d''attiéké (semoule de manioc)', 500),
        ('az-d26', 'Portion d''Igname Frite / Bouillie', 'Terroir', '/images/yopougon/food/cuisine_2.png', 'azaguie', 'Portion d''igname frite ou bouillie', 1000),
        ('az-d27', 'Portion de Riz', 'Terroir', '/images/yopougon/food/cuisine_1.png', 'azaguie', 'Portion de riz blanc nature', 1000),
        ('az-b1', 'Heineken', 'Bières', '/images/yopougon/drinks/heineken.png', 'azaguie', 'Bière blonde Heineken', 700),
        ('az-b2', 'Despérados', 'Bières', '/images/yopougon/drinks/desperados.png', 'azaguie', 'Bière aromatisée Tequila', 700),
        ('az-b3', 'Beaufort', 'Bières', '/images/yopougon/drinks/beaufort.png', 'azaguie', 'Bière blonde Beaufort', 700),
        ('az-b4', 'Doppel Munich', 'Bières', '/images/yopougon/drinks/doppel.png', 'azaguie', 'Bière brune forte Doppel Munich', 700),
        ('az-b5', 'Doppel Energy', 'Bières', '/images/yopougon/drinks/doppel_energy.png', 'azaguie', 'Bière Doppel Energy booster', 700),
        ('az-b6', 'Tequila Beer', 'Bières', '/images/yopougon/drinks/tequila.png', 'azaguie', 'Bière aromatisée Tequila', 700),
        ('az-b7', 'Racines', 'Bières', '/images/yopougon/drinks/racines.png', 'azaguie', 'Boisson alcoolisée aux extraits de plantes Racines', 700),
        ('az-b8', 'Bavaria', 'Bières', '/images/yopougon/drinks/bavaria.png', 'azaguie', 'Bière Bavaria', 700),
        ('az-b9', 'Bock 66', 'Bières', '/images/yopougon/drinks/bock.png', 'azaguie', 'Bière Bock 66', 700),
        ('az-b10', 'Cody''s', 'Bières', '/images/yopougon/drinks/codys.png', 'azaguie', 'Bière Cody''s', 700),
        ('az-b11', 'Castel Beer', 'Bières', '/images/yopougon/drinks/castel.png', 'azaguie', 'Bière Castel Lager', 700),
        ('az-b12', 'Guinness', 'Bières', '/images/yopougon/drinks/guinness.png', 'azaguie', 'Bière brune Guinness stout', 1000),
        ('az-b13', 'Budweiser', 'Bières', '/images/yopougon/drinks/budweiser.png', 'azaguie', 'Bière blonde Budweiser', 1000),
        ('az-b14', 'Chill', 'Sucreries', '/images/yopougon/drinks/chill.png', 'azaguie', 'Bière Chill aromatisée', 800),
        ('az-b15', 'Orangina', 'Sucreries', '/images/yopougon/drinks/orangina.png', 'azaguie', 'Boisson gazeuse Orangina aux fruits', 800),
        ('az-b16', 'Malta Guinness', 'Sucreries', '/images/yopougon/drinks/malta.png', 'azaguie', 'Boisson maltée sans alcool Malta', 800),
        ('az-b17', 'Smirnoff Ice', 'Sucreries', '/images/yopougon/drinks/smirnoff.png', 'azaguie', 'Boisson prémixée Smirnoff Ice (Sminorffice)', 800),
        ('az-b18', 'Coca-Cola', 'Softs', '/images/yopougon/drinks/coca.png', 'azaguie', 'Boisson gazeuse Coca-Cola', 600),
        ('az-b19', 'Sprite', 'Softs', '/images/yopougon/drinks/sprite.png', 'azaguie', 'Boisson gazeuse Sprite citron-limon', 600),
        ('az-b20', 'Fanta', 'Softs', '/images/yopougon/drinks/fanta.png', 'azaguie', 'Boisson gazeuse Fanta orange', 600),
        ('az-b21', 'Tonic', 'Softs', '/images/yopougon/drinks/tonic.png', 'azaguie', 'Boisson gazeuse Tonic Schweppes', 600),
        ('az-b22', 'Moka Café', 'Softs', '/images/yopougon/drinks/moka.png', 'azaguie', 'Boisson Moka Café', 700),
        ('az-b23', 'Bouteille de Vin', 'Vins', '/images/yopougon/drinks/vin.png', 'azaguie', 'Vin de table sélectionné (Rouge/Rosé/Blanc). À partir de 2500 F', 2500)
    `);

    // Admin & Super Admin Users
    await prisma.$executeRawUnsafe(`
      INSERT OR IGNORE INTO "User" (id, email, name, password, role)
      VALUES 
        ('usr-super', 'admin@hambol.com', 'Super Admin Hambol', 'hambol2025', 'SUPER_ADMIN'),
        ('usr-admin', 'direction@hambol.com', 'Direction Hambol', 'hambol2025', 'ADMIN')
    `);

    // Staff Profiles
    await prisma.$executeRawUnsafe(`
      INSERT OR IGNORE INTO "Staff" (id, userId, siteId, position)
      VALUES
        ('stf-super', 'usr-super', 'azaguie', 'SUPER_ADMIN'),
        ('stf-admin', 'usr-admin', 'azaguie', 'ADMIN')
    `);

    return NextResponse.json({
      success: true,
      message: '✅ Base de données et TARIFS HOTEL initialisés avec succès !',
      counts: {
        sites: 2,
        tariffs: tariffs.length,
        rooms: 22
      },
      comptes: {
        superAdmin: { email: 'admin@hambol.com', password: 'hambol2025', role: 'SUPER_ADMIN' },
        direction: { email: 'direction@hambol.com', password: 'hambol2025', role: 'ADMIN' }
      }
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Setup error:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
