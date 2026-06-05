import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendReservationStatusEmail } from '@/lib/email';

export async function GET(req: Request) {
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
  try {
    const body = await req.json();
    const { id, status } = body;

    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status },
    });

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
