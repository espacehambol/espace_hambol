/**
 * Script to create the SQLite database directly using better-sqlite3
 * Run: node prisma/create-db.js
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'dev.db');

// Remove existing DB to start fresh
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('✓ Old database removed');
}

const db = new Database(DB_PATH);
console.log('✓ Database created at', DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create all tables
db.exec(`
  CREATE TABLE IF NOT EXISTS "Site" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "LoyaltyCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "points" INTEGER NOT NULL DEFAULT 0,
    "tier" TEXT NOT NULL DEFAULT 'SILVER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS "Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "pricePerNight" REAL NOT NULL,
    "siteId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("siteId") REFERENCES "Site"("id")
  );

  CREATE TABLE IF NOT EXISTS "Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "roomTypeId" TEXT,
    "checkIn" TEXT NOT NULL,
    "checkOut" TEXT NOT NULL,
    "guests" TEXT NOT NULL DEFAULT '1',
    "totalPrice" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "siteName" TEXT NOT NULL DEFAULT 'Azaguié',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "price" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "siteId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("siteId") REFERENCES "Site"("id")
  );

  CREATE TABLE IF NOT EXISTS "Staff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "phone" TEXT,
    "siteId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("siteId") REFERENCES "Site"("id")
  );

  CREATE TABLE IF NOT EXISTS "InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "minQuantity" INTEGER NOT NULL DEFAULT 5,
    "unit" TEXT NOT NULL DEFAULT 'unité',
    "siteId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("siteId") REFERENCES "Site"("id")
  );
`);
console.log('✓ All tables created');

// --- Seed Data ---

const insertSite = db.prepare(`INSERT OR REPLACE INTO "Site" (id, name, location, description) VALUES (?, ?, ?, ?)`);
const insertUser = db.prepare(`INSERT OR IGNORE INTO "User" (id, email, name, password, role) VALUES (?, ?, ?, ?, ?)`);
const insertLoyalty = db.prepare(`INSERT OR IGNORE INTO "LoyaltyCard" (id, userId, points, tier) VALUES (?, ?, ?, ?)`);
const insertTransaction = db.prepare(`INSERT OR IGNORE INTO "Transaction" (id, userId, amount, type, status, description) VALUES (?, ?, ?, ?, ?, ?)`);
const insertRoom = db.prepare(`INSERT OR IGNORE INTO "Room" (id, name, type, status, pricePerNight, siteId) VALUES (?, ?, ?, ?, ?, ?)`);
const insertInventory = db.prepare(`INSERT OR IGNORE INTO "InventoryItem" (id, name, quantity, minQuantity, unit, siteId) VALUES (?, ?, ?, ?, ?, ?)`);
const insertStaff = db.prepare(`INSERT OR IGNORE INTO "Staff" (id, name, role, email, phone, siteId) VALUES (?, ?, ?, ?, ?, ?)`);

function cuid() {
  return 'c' + Math.random().toString(36).substr(2, 24);
}

// Sites
insertSite.run('azaguie', 'Azaguié', 'Ahoua', "L'Évasion Naturelle");
insertSite.run('yopougon', 'Yopougon', 'Ananeraie', "L'Élégance Urbaine");
console.log('✓ Sites seeded');

// Users
insertUser.run(cuid(), 'direction@hambol.com', 'Direction Hambol', 'hambol2025', 'ADMIN');
console.log('✓ Admin user seeded');

db.close();
console.log('\n✅ Database successfully initialized (Clean Production State)!');
console.log('📁 File location:', DB_PATH);
console.log('\n📋 Production account:');
console.log('   ADMIN   → direction@hambol.com / hambol2025');
console.log('   ADMIN   → direction@hambol.com / hambol2025');
