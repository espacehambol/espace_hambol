import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/authorize';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = authorize(request, ['ADMIN', 'MANAGER', 'RECEPTION']);
  if (!auth.authorized) return auth.response;

  try {
    const today = new Date();
    
    // Simulate J-2 (Pre-arrival Upsell)
    // Find reservations where checkIn is roughly 2 days from now
    const inTwoDays = new Date(today);
    inTwoDays.setDate(inTwoDays.getDate() + 2);
    const startOfJ2 = new Date(inTwoDays.setHours(0,0,0,0));
    const endOfJ2 = new Date(inTwoDays.setHours(23,59,59,999));

    const preArrivalRes = await (prisma as any).reservation.findMany({
      where: {
        status: 'CONFIRMED',
        checkIn: { gte: startOfJ2, lte: endOfJ2 }
      },
      include: { client: true }
    });

    // Simulate J+1 (Post-stay Review request)
    // Find reservations where checkOut was roughly 1 day ago
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfJMinus1 = new Date(yesterday.setHours(0,0,0,0));
    const endOfJMinus1 = new Date(yesterday.setHours(23,59,59,999));

    const postStayRes = await (prisma as any).reservation.findMany({
      where: {
        status: 'COMPLETED',
        checkOut: { gte: startOfJMinus1, lte: endOfJMinus1 }
      },
      include: { client: true }
    });

    // Build the response payload representing the actions the cron would take
    const logs = [];

    for (const res of preArrivalRes) {
      logs.push({
        type: 'PRE_ARRIVAL_UPSELL',
        clientName: res.client.name,
        clientEmail: res.client.email,
        message: `Email "Préparez votre séjour" envoyé à ${res.client.email} avec des offres d'upsell.`
      });
    }

    for (const res of postStayRes) {
      logs.push({
        type: 'POST_STAY_REVIEW',
        clientName: res.client.name,
        clientEmail: res.client.email,
        message: `Email "Merci pour votre séjour" envoyé à ${res.client.email} avec lien TripAdvisor/Google.`
      });
    }

    return NextResponse.json({
      success: true,
      simulatedDate: today,
      preArrivalCount: preArrivalRes.length,
      postStayCount: postStayRes.length,
      logs
    });

  } catch (error) {
    console.error('CRM Marketing Cron Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
