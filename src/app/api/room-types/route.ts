import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const roomTypes = await prisma.roomType.findMany({
      orderBy: { price: 'asc' }
    });

    return NextResponse.json({ roomTypes });
  } catch (error) {
    console.error('Fetch room types error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
