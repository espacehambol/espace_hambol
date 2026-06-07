const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Review" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PENDING'`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Review" ADD COLUMN "site" TEXT NOT NULL DEFAULT 'Yopougon'`);
    console.log('Columns added successfully');
  } catch (e) {
    console.log('Error adding columns:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
