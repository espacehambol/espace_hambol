import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('siteId');

  try {
    const inventory = await (prisma as any).inventoryItem.findMany({
      where: siteId ? { siteId } : {},
      include: {
        site: true
      },
      orderBy: { category: 'asc' }
    });
    return NextResponse.json(inventory);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const item = await (prisma as any).inventoryItem.create({
      data: {
        name: body.name,
        category: body.category,
        quantity: body.quantity,
        unit: body.unit,
        minThreshold: body.minThreshold || 5,
        siteId: body.siteId
      }
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
