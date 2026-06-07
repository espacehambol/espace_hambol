import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Ce fichier simule l'intégration avec un provider de paiement (ex: CinetPay, Paystack)
// Dans un environnement de production, on appellerait l'API du provider pour générer un lien de paiement.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reservationId, amount, method } = body;

    if (!reservationId || !amount || !method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { client: true }
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // SIMULATION D'APPEL A UNE API DE PAIEMENT
    // Ex: const payUrl = await cinetpay.generatePaymentLink(...)
    
    // On génère un faux ID de transaction (Intent)
    const paymentIntentId = `pi_sim_${Math.random().toString(36).substring(2, 15)}`;

    // Mettre à jour la réservation avec l'intention de paiement
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        paymentIntentId,
        paymentStatus: 'PENDING_PAYMENT'
      }
    });

    // Enregistrer la transaction "PENDING"
    await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type: 'PAYMENT',
        status: 'PENDING',
        description: `Paiement ${method} pour la réservation ${reservationId}`,
        userId: reservation.clientId,
        reservationId: reservation.id
      }
    });

    // On renvoie un lien simulé
    // Dans le cas réel, on renvoie l'URL vers laquelle le client doit être redirigé
    const paymentUrl = `/client/reservations/payment-simulator?intent=${paymentIntentId}&amount=${amount}&method=${method}`;

    return NextResponse.json({ success: true, paymentUrl, paymentIntentId });

  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Webhook simulé pour confirmer le paiement
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { paymentIntentId, status } = body;

    if (!paymentIntentId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const reservation = await prisma.reservation.findFirst({
      where: { paymentIntentId }
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found for this payment intent' }, { status: 404 });
    }

    if (status === 'SUCCESS') {
      // 1. Mettre à jour la réservation
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED' // Confirmer la résa automatiquement
        }
      });

      // 2. Mettre à jour la transaction
      await prisma.transaction.updateMany({
        where: { reservationId: reservation.id, status: 'PENDING' },
        data: { status: 'PAID' }
      });

      return NextResponse.json({ success: true, message: 'Payment confirmed' });
    } else {
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { paymentStatus: 'FAILED' }
      });
      return NextResponse.json({ success: false, message: 'Payment failed' });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
