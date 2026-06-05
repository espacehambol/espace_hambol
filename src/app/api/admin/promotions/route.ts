import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const DEFAULT_PATH = path.join(process.cwd(), 'src', 'data', 'promotions.json');

// Self-healing database check to create the SystemSetting table on shared hosting environments
async function ensureSystemSettingTableExists() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SystemSetting" (
        "key" TEXT NOT NULL PRIMARY KEY,
        "value" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error('[promotions-api] Failed to ensure SystemSetting table exists:', err);
  }
}

async function getPromotionsData() {
  try {
    // Ensure the table exists in the connected database
    await ensureSystemSettingTableExists();

    // 1. Try to fetch from DB
    const dbSetting = await prisma.systemSetting.findUnique({
      where: { key: 'promotions' }
    });

    if (dbSetting) {
      return JSON.parse(dbSetting.value);
    }

    // 2. If not found in DB, auto-migrate from src/data/promotions.json template
    console.log('[promotions-api] Promotions not found in DB. Auto-migrating template...');
    let parsed = {};
    try {
      const raw = await readFile(DEFAULT_PATH, 'utf-8');
      parsed = JSON.parse(raw);
    } catch (fileErr) {
      console.warn('[promotions-api] Template file not found or invalid:', fileErr);
      // Fallback structure in case the template file is not copied in Next standalone build
      parsed = {
        "Azaguié": {
          "popup": { "enabled": false, "imageUrl": "", "link": "", "title": "Offre Spéciale Azaguié" },
          "floatingAd": { "enabled": false, "imageUrl": "", "link": "", "title": "Découvrez nos offres", "delayMs": 6000, "intervalMs": 45000 },
          "socials": []
        },
        "Yopougon": {
          "popup": { "enabled": false, "imageUrl": "", "link": "", "title": "Offre Spéciale Yopougon" },
          "floatingAd": { "enabled": false, "imageUrl": "", "link": "", "title": "Découvrez nos offres", "delayMs": 6000, "intervalMs": 45000 },
          "socials": []
        }
      };
    }

    // Save initial config to DB
    await prisma.systemSetting.upsert({
      where: { key: 'promotions' },
      update: { value: JSON.stringify(parsed) },
      create: { key: 'promotions', value: JSON.stringify(parsed) }
    });

    return parsed;
  } catch (error) {
    console.error('[promotions-api] Error reading promotions:', error);
    return {};
  }
}

export async function GET() {
  const data = await getPromotionsData();
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    }
  });
}

export async function PUT(request: Request) {
  try {
    // Ensure the table exists in the connected database
    await ensureSystemSettingTableExists();

    const body = await request.json();
    const valueString = JSON.stringify(body);

    await prisma.systemSetting.upsert({
      where: { key: 'promotions' },
      update: { value: valueString },
      create: { key: 'promotions', value: valueString }
    });
    
    console.log('[promotions-api] Successfully saved promotions to database');
    return NextResponse.json({ success: true }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      }
    });
  } catch (error) {
    console.error('Promotions write error:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la sauvegarde',
      detail: String(error)
    }, { status: 500 });
  }
}
