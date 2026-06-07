import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/authorize';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = authorize(req, ['ADMIN', 'MANAGER', 'CHEF_CUISINIER']);
  if (!auth.authorized) return auth.response;

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
  const auth = authorize(req, ['ADMIN', 'MANAGER', 'CHEF_CUISINIER']);
  if (!auth.authorized) return auth.response;

  try {
    const { reservationId, clientId, amount, itemsDescription } = await req.json();

    if (!reservationId || !clientId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Start a transaction:
    // 1. Fetch reservation room siteId
    // 2. Create a POS Invoice Transaction associated with the Reservation
    // 3. Increment Reservation total price
    const result = await prisma.$transaction(async (tx) => {
      const reservationData = await tx.reservation.findUnique({
        where: { id: reservationId },
        include: { room: true }
      });
      if (!reservationData) throw new Error('Reservation not found');

      const transaction = await tx.transaction.create({
        data: {
          amount: parseFloat(amount.toString()),
          type: 'INVOICE',
          status: 'PENDING', // Will be paid on check-out
          description: `Restauration POS - Imputation Chambre : ${itemsDescription || 'Consommation Restaurant'}`,
          userId: clientId,
          reservationId: reservationId,
          siteId: reservationData.room.siteId,
          category: 'RESTAURANT'
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
