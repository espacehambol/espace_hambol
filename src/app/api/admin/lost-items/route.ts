import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/authorize';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = authorize(req, ['ADMIN', 'MANAGER', 'HOUSEKEEPING']);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get('siteId') || 'azaguie';

    const lostItems = await (prisma as any).lostItem.findMany({
      where: { siteId },
      orderBy: { dateFound: 'desc' }
    });

    return NextResponse.json({ success: true, lostItems });
  } catch (error) {
    console.error('Fetch lost items error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = authorize(req, ['ADMIN', 'MANAGER', 'HOUSEKEEPING']);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { name, description, photoUrl, roomNumber, siteId, dateFound } = body;

    const lostItem = await (prisma as any).lostItem.create({
      data: {
        name,
        description,
        photoUrl: photoUrl || '',
        roomNumber,
        siteId,
        dateFound: dateFound ? new Date(dateFound) : new Date(),
        status: 'FOUND'
      }
    });

    return NextResponse.json({ success: true, lostItem });
  } catch (error) {
    console.error('Create lost item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = authorize(req, ['ADMIN', 'MANAGER', 'HOUSEKEEPING']);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { id, status, trackingNumber } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;

    const lostItem = await (prisma as any).lostItem.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, lostItem });
  } catch (error) {
    console.error('Update lost item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = authorize(req, ['ADMIN', 'MANAGER', 'HOUSEKEEPING']);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await (prisma as any).lostItem.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete lost item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
