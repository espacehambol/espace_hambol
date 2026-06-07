import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendReservationStatusEmail } from '@/lib/email';
import { authorize } from '@/lib/authorize';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = authorize(req, ['ADMIN', 'MANAGER', 'RECEPTION']);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get('siteId') || 'azaguie';

    const [reservations, rooms] = await Promise.all([
      prisma.reservation.findMany({
        where: {
          room: { siteId }
        },
        include: {
          room: {
            include: {
              site: true,
              roomType: true,
            }
          },
          client: true,
          kycData: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.room.findMany({
        where: { siteId },
        orderBy: { number: 'asc' }
      })
    ]);

    return NextResponse.json({ reservations, rooms });
  } catch (error) {
    console.error('Fetch reservations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = authorize(req, ['ADMIN', 'MANAGER', 'RECEPTION']);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { id, status, checkInStatus } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (checkInStatus) updateData.checkInStatus = checkInStatus;

    const reservation = await prisma.reservation.update({
      where: { id },
      data: updateData,
    });

    // Handle room status updates automatically
    if (status === 'COMPLETED' || checkInStatus === 'CHECKED_OUT') {
      await prisma.room.update({
        where: { id: reservation.roomId },
        data: { status: 'DIRTY' },
      });
    } else if (checkInStatus === 'CHECKED_IN') {
      await prisma.room.update({
        where: { id: reservation.roomId },
        data: { status: 'OCCUPIED' },
      });
    }

    if (status === 'CONFIRMED' || status === 'CANCELLED') {
      sendReservationStatusEmail(reservation.id).catch((err) => {
        console.error('Failed to send reservation status email:', err);
      });
    }

    return NextResponse.json({ success: true, reservation });
  } catch (error) {
    console.error('Update reservation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
