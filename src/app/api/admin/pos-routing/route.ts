import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch checked-in/active reservations
    const reservations = await prisma.reservation.findMany({
      where: {
        status: 'CONFIRMED' // Only confirmed reservations can have items routed to them
      },
      include: {
        client: { select: { id: true, name: true } },
        room: { select: { id: true, number: true } }
      }
    });

    const activeRooms = reservations.map(res => ({
      reservationId: res.id,
      roomId: res.room.id,
      roomNumber: res.room.number,
      clientName: res.client.name,
      clientId: res.client.id
    }));

    return NextResponse.json({ success: true, activeRooms });
  } catch (error) {
    console.error('Fetch active rooms for POS routing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { reservationId, clientId, amount, itemsDescription } = await req.json();

    if (!reservationId || !clientId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Start a transaction:
    // 1. Create a POS Invoice Transaction associated with the Reservation
    // 2. Increment Reservation total price
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          amount: parseFloat(amount.toString()),
          type: 'INVOICE',
          status: 'PENDING', // Will be paid on check-out
          description: `Restauration POS - Imputation Chambre : ${itemsDescription || 'Consommation Restaurant'}`,
          userId: clientId,
          reservationId: reservationId
        }
      });

      const reservation = await tx.reservation.update({
        where: { id: reservationId },
        data: {
          totalPrice: {
            increment: parseFloat(amount.toString())
          }
        }
      });

      return { transaction, reservation };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('POS routing POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
