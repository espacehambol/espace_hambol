import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { reservationId, idType, idNumber, idExpiry, idImage } = await request.json();

    if (!reservationId || !idType || !idNumber) {
      return NextResponse.json({ error: 'Missing required KYC fields' }, { status: 400 });
    }

    // 1. Create or update KycData
    const kyc = await prisma.kycData.upsert({
      where: { reservationId },
      update: { 
        idType, 
        idNumber, 
        idExpiry: idExpiry ? new Date(idExpiry) : null, 
        idImage 
      },
      create: { 
        reservationId, 
        idType, 
        idNumber, 
        idExpiry: idExpiry ? new Date(idExpiry) : null, 
        idImage 
      }
    });

    // 2. Update Reservation checkInStatus
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { checkInStatus: 'KYC_SUBMITTED' }
    });

    return NextResponse.json({ success: true, kyc });
  } catch (error) {
    console.error('KYC error:', error);
    return NextResponse.json({ error: 'Failed to submit KYC data' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reservationId = searchParams.get('reservationId');

  if (!reservationId) {
    return NextResponse.json({ error: 'Reservation ID is required' }, { status: 400 });
  }

  try {
    const kyc = await prisma.kycData.findUnique({
      where: { reservationId }
    });

    return NextResponse.json({ kyc });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch KYC' }, { status: 500 });
  }
}
