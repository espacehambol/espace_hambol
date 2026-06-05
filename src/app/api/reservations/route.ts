import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendReservationRequestEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      checkIn, 
      checkOut, 
      siteName, 
      clientName, 
      clientEmail, 
      totalPrice 
    } = body;

    // Resolve site by name
    const site = await prisma.site.findFirst({
      where: { name: siteName },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site non trouvé' }, { status: 404 });
    }

    // Find ANY available room in this site
    const availableRoom = await prisma.room.findFirst({
      where: {
        siteId: site.id,
        status: 'AVAILABLE',
      },
    });

    if (!availableRoom) {
      return NextResponse.json({ error: 'Complet : Aucune chambre disponible pour ce site' }, { status: 400 });
    }

    // Create or find user (Client)
    let user = await prisma.user.findUnique({
      where: { email: clientEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: clientEmail,
          name: clientName,
          password: 'hambol_guest', // Default password for guest accounts
          role: 'CLIENT',
        },
      });
    }

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        roomId: availableRoom.id,
        clientId: user.id,
        status: 'PENDING',
        totalPrice: parseFloat(totalPrice.toString()),
      },
    });

    // Envoi de l'e-mail de confirmation de demande en arrière-plan
    sendReservationRequestEmail(reservation.id).catch((err) => {
      console.error('Failed to send reservation request email:', err);
    });

    return NextResponse.json({ success: true, reservation });
  } catch (error) {
    console.error('Create reservation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
