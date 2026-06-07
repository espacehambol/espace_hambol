import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/authorize';

export async function GET(request: Request) {
  const auth = authorize(request, ['ADMIN', 'MANAGER', 'HOUSEKEEPING', 'RECEPTION']);
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('siteId');

  if (!siteId) {
    return NextResponse.json({ error: 'Site ID is required' }, { status: 400 });
  }

  try {
    const rooms = await prisma.room.findMany({
      where: { siteId: siteId },
      include: {
        roomType: true
      },
      orderBy: { number: 'asc' }
    });

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('Fetch rooms error:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = authorize(request, ['ADMIN', 'MANAGER', 'HOUSEKEEPING', 'RECEPTION']);
  if (!auth.authorized) return auth.response;

  try {
    const { roomId, status } = await request.json();

    if (!roomId || !status) {
      return NextResponse.json({ error: 'Room ID and status are required' }, { status: 400 });
    }

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: { status },
      include: { roomType: true }
    });

    return NextResponse.json({ success: true, room: updatedRoom });
  } catch (error) {
    console.error('Update room status error:', error);
    return NextResponse.json({ error: 'Failed to update room status' }, { status: 500 });
  }
}
