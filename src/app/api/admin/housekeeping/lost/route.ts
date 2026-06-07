import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get('siteId');

    const whereClause = siteId ? { site: { name: siteId } } : {};

    const items = await (prisma as any).lostItem.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        site: { select: { name: true } }
      }
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Fetch lost items error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, location, siteId } = body;

    const site = await prisma.site.findFirst({
      where: { name: siteId }
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    const item = await (prisma as any).lostItem.create({
      data: {
        name,
        description,
        location,
        siteId: site.id,
        status: 'FOUND'
      }
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Create lost item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    const item = await (prisma as any).lostItem.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Update lost item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
