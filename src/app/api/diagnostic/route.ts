import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const dbPath = path.resolve(process.cwd(), 'dev.db');
  const exists = fs.existsSync(dbPath);
  
  let stats = null;
  let writable = false;
  
  if (exists) {
    stats = fs.statSync(dbPath);
    try {
      fs.accessSync(dbPath, fs.constants.W_OK);
      writable = true;
    } catch (e) {
      writable = false;
    }
  }

  return NextResponse.json({
    cwd: process.cwd(),
    dbPath,
    exists,
    writable,
    stats: stats ? {
      size: stats.size,
      mode: stats.mode,
      uid: stats.uid,
      gid: stats.gid,
    } : null,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'PRESENT (HIDDEN)' : 'MISSING',
    }
  });
}
