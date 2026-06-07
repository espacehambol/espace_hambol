import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Simulated OTA Channels config
const CHANNELS = [
  { id: 'booking', name: 'Booking.com', icon: '🏨', active: true },
  { id: 'airbnb', name: 'Airbnb', icon: '🏡', active: true },
  { id: 'expedia', name: 'Expedia', icon: '✈️', active: false },
];

export async function GET() {
  try {
    // Generate some mock synchronization logs
    const mockLogs = [
      {
        id: 'log1',
        channel: 'Booking.com',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'SUCCESS',
        details: 'Disponibilités des 11 chambres mises à jour.'
      },
      {
        id: 'log2',
        channel: 'Airbnb',
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        status: 'SUCCESS',
        details: 'Nouvelle réservation #AB-90182 importée (Koffi Charles, Chambre 102).'
      },
      {
        id: 'log3',
        channel: 'Expedia',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        status: 'WARNING',
        details: 'Échec de synchronisation temporaire - Clé API invalide.'
      }
    ];

    return NextResponse.json({ success: true, channels: CHANNELS, logs: mockLogs });
  } catch (error) {
    console.error('Channel manager error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { action, siteId } = await req.json();

    if (action === 'sync') {
      // Find site and first available room to import a mock reservation
      const site = await prisma.site.findFirst({
        where: { id: siteId || 'azaguie' }
      });

      if (!site) {
        return NextResponse.json({ error: 'Site not found' }, { status: 404 });
      }

      const availableRoom = await prisma.room.findFirst({
        where: { siteId: site.id, status: 'AVAILABLE' }
      });

      if (!availableRoom) {
        return NextResponse.json({
          success: true,
          syncedCount: 0,
          message: 'Canaux synchronisés. Aucune chambre libre pour de nouvelles réservations OTA.'
        });
      }

      // Create a mock User/Client if not exists
      let client = await prisma.user.findUnique({
        where: { email: 'client.booking@example.com' }
      });

      if (!client) {
        client = await prisma.user.create({
          data: {
            email: 'client.booking@example.com',
            name: 'Booking.com Guest (Sync)',
            password: 'booking_sync_mock',
            role: 'CLIENT'
          }
        });
      }

      // Create a mock reservation coming from Booking.com
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() + 1);
      const checkOut = new Date();
      checkOut.setDate(checkOut.getDate() + 3);

      const reservation = await prisma.reservation.create({
        data: {
          checkIn,
          checkOut,
          roomId: availableRoom.id,
          clientId: client.id,
          status: 'CONFIRMED',
          totalPrice: 75000,
        }
      });

      // Also set the Room status to occupied or leave it to trigger check-in
      // Usually OTA reservation is confirmed

      return NextResponse.json({
        success: true,
        syncedCount: 1,
        message: 'Synchronisation réussie ! 1 nouvelle réservation importée de Booking.com.',
        reservation
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Sync POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
